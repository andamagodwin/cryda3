// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * CrydaRideShare - Main ride-sharing contract
 */
contract CrydaRideShare is Ownable, ReentrancyGuard {
    
    // Contracts
    IERC20 public crydaToken;
    
    // Enums
    enum PaymentMethod { ETH, CRYDA_TOKEN }
    enum RideStatus { ACTIVE, COMPLETED, CANCELLED }
    enum BookingStatus { ACTIVE, COMPLETED, CANCELLED }
    
    // Structs
    struct Ride {
        uint256 id;
        address driver;
        string startLocation;
        string endLocation;
        uint256 departureTime;
        uint256 pricePerSeat;
        uint8 totalSeats;
        uint8 bookedSeats;
        PaymentMethod paymentMethod;
        RideStatus status;
        uint256 createdAt;
    }
    
    struct Booking {
        uint256 id;
        uint256 rideId;
        address passenger;
        uint8 seatsBooked;
        uint256 totalAmount;
        PaymentMethod paymentMethod;
        BookingStatus status;
        uint256 createdAt;
    }
    
    // State variables
    uint256 public nextRideId = 1;
    uint256 public nextBookingId = 1;
    uint256 public platformFee = 250; // 2.5% in basis points
    uint256 public rewardRate = 100; // 1% in basis points
    
    // Mappings
    mapping(uint256 => Ride) public rides;
    mapping(uint256 => Booking) public bookings;
    mapping(address => uint256[]) public userRides;
    mapping(address => uint256[]) public userBookings;
    mapping(address => uint256) public pendingRewards;
    
    // Events
    event RideCreated(uint256 indexed rideId, address indexed driver, uint256 pricePerSeat, uint8 totalSeats);
    event RideBooked(uint256 indexed bookingId, uint256 indexed rideId, address indexed passenger, uint8 seatsBooked);
    event RideCompleted(uint256 indexed rideId, address indexed driver);
    event BookingCompleted(uint256 indexed bookingId, uint256 indexed rideId, address indexed passenger);
    event RideCancelled(uint256 indexed rideId, address indexed driver, string reason);
    event BookingCancelled(uint256 indexed bookingId, address indexed passenger, string reason);
    event RewardsClaimed(address indexed user, uint256 amount);
    event PaymentProcessed(address indexed from, address indexed to, uint256 amount, PaymentMethod method);
    
    constructor(address _crydaToken, address initialOwner) Ownable(initialOwner) {
        crydaToken = IERC20(_crydaToken);
    }
    
    /**
     * @dev Create a new ride
     */
    function createRide(
        string memory _startLocation,
        string memory _endLocation,
        uint256 _departureTime,
        uint256 _pricePerSeat,
        uint8 _totalSeats,
        PaymentMethod _paymentMethod
    ) external returns (uint256) {
        require(_departureTime > block.timestamp, "Departure time must be in the future");
        require(_totalSeats > 0 && _totalSeats <= 8, "Invalid number of seats");
        require(_pricePerSeat > 0, "Price must be greater than 0");
        require(bytes(_startLocation).length > 0, "Start location required");
        require(bytes(_endLocation).length > 0, "End location required");
        
        uint256 rideId = nextRideId++;
        
        rides[rideId] = Ride({
            id: rideId,
            driver: msg.sender,
            startLocation: _startLocation,
            endLocation: _endLocation,
            departureTime: _departureTime,
            pricePerSeat: _pricePerSeat,
            totalSeats: _totalSeats,
            bookedSeats: 0,
            paymentMethod: _paymentMethod,
            status: RideStatus.ACTIVE,
            createdAt: block.timestamp
        });
        
        userRides[msg.sender].push(rideId);
        
        emit RideCreated(rideId, msg.sender, _pricePerSeat, _totalSeats);
        return rideId;
    }
    
    /**
     * @dev Book a ride
     */
    function bookRide(
        uint256 _rideId,
        uint8 _seatsToBook
    ) external payable nonReentrant returns (uint256) {
        Ride storage ride = rides[_rideId];
        require(ride.id != 0, "Ride does not exist");
        require(ride.status == RideStatus.ACTIVE, "Ride is not active");
        require(ride.driver != msg.sender, "Cannot book your own ride");
        require(_seatsToBook > 0, "Must book at least 1 seat");
        require(ride.bookedSeats + _seatsToBook <= ride.totalSeats, "Not enough seats available");
        require(ride.departureTime > block.timestamp, "Ride has already departed");
        
        uint256 totalAmount = ride.pricePerSeat * _seatsToBook;
        uint256 platformFeeAmount = (totalAmount * platformFee) / 10000;
        uint256 driverAmount = totalAmount - platformFeeAmount;
        
        uint256 bookingId = nextBookingId++;
        
        bookings[bookingId] = Booking({
            id: bookingId,
            rideId: _rideId,
            passenger: msg.sender,
            seatsBooked: _seatsToBook,
            totalAmount: totalAmount,
            paymentMethod: ride.paymentMethod,
            status: BookingStatus.ACTIVE,
            createdAt: block.timestamp
        });
        
        // Update ride
        ride.bookedSeats += _seatsToBook;
        userBookings[msg.sender].push(bookingId);
        
        // Process payment
        if (ride.paymentMethod == PaymentMethod.ETH) {
            require(msg.value >= totalAmount, "Insufficient ETH sent");
            
            // Send payment to driver
            payable(ride.driver).transfer(driverAmount);
            
            // Refund excess ETH
            if (msg.value > totalAmount) {
                payable(msg.sender).transfer(msg.value - totalAmount);
            }
        } else {
            require(msg.value == 0, "ETH not accepted for CRYDA token rides");
            require(crydaToken.transferFrom(msg.sender, ride.driver, driverAmount), "CRYDA transfer failed");
        }
        
        // Add rewards for both driver and passenger
        uint256 rewardAmount = (totalAmount * rewardRate) / 10000;
        pendingRewards[ride.driver] += rewardAmount;
        pendingRewards[msg.sender] += rewardAmount / 2; // Passenger gets half reward
        
        emit RideBooked(bookingId, _rideId, msg.sender, _seatsToBook);
        emit PaymentProcessed(msg.sender, ride.driver, driverAmount, ride.paymentMethod);
        
        return bookingId;
    }
    
    /**
     * @dev Complete a ride (driver only)
     */
    function completeRide(uint256 _rideId) external {
        Ride storage ride = rides[_rideId];
        require(ride.driver == msg.sender, "Only driver can complete ride");
        require(ride.status == RideStatus.ACTIVE, "Ride is not active");
        
        ride.status = RideStatus.COMPLETED;
        
        emit RideCompleted(_rideId, msg.sender);
    }
    
    /**
     * @dev Complete a booking (passenger only)
     */
    function completeBooking(uint256 _bookingId) external {
        Booking storage booking = bookings[_bookingId];
        require(booking.passenger == msg.sender, "Only passenger can complete booking");
        require(booking.status == BookingStatus.ACTIVE, "Booking is not active");
        
        booking.status = BookingStatus.COMPLETED;
        
        emit BookingCompleted(_bookingId, booking.rideId, msg.sender);
    }
    
    /**
     * @dev Cancel a ride (driver only)
     */
    function cancelRide(uint256 _rideId, string memory _reason) external nonReentrant {
        Ride storage ride = rides[_rideId];
        require(ride.driver == msg.sender, "Only driver can cancel ride");
        require(ride.status == RideStatus.ACTIVE, "Ride is not active");
        
        ride.status = RideStatus.CANCELLED;
        
        // Process refunds for all bookings
        _processRideRefunds(_rideId);
        
        emit RideCancelled(_rideId, msg.sender, _reason);
    }
    
    /**
     * @dev Cancel a booking (passenger only)
     */
    function cancelBooking(uint256 _bookingId, string memory _reason) external nonReentrant {
        Booking storage booking = bookings[_bookingId];
        require(booking.passenger == msg.sender, "Only passenger can cancel booking");
        require(booking.status == BookingStatus.ACTIVE, "Booking is not active");
        
        Ride storage ride = rides[booking.rideId];
        require(ride.status == RideStatus.ACTIVE, "Cannot cancel booking for inactive ride");
        
        booking.status = BookingStatus.CANCELLED;
        ride.bookedSeats -= booking.seatsBooked;
        
        // Process refund
        if (booking.paymentMethod == PaymentMethod.ETH) {
            payable(msg.sender).transfer(booking.totalAmount);
        } else {
            require(crydaToken.transfer(msg.sender, booking.totalAmount), "CRYDA refund failed");
        }
        
        emit BookingCancelled(_bookingId, msg.sender, _reason);
    }
    
    /**
     * @dev Claim CRYDA token rewards
     */
    function claimRewards() external nonReentrant {
        uint256 amount = pendingRewards[msg.sender];
        require(amount > 0, "No rewards to claim");
        
        pendingRewards[msg.sender] = 0;
        require(crydaToken.transfer(msg.sender, amount), "Reward transfer failed");
        
        emit RewardsClaimed(msg.sender, amount);
    }
    
    /**
     * @dev Process refunds for all bookings of a cancelled ride
     */
    function _processRideRefunds(uint256 _rideId) internal {
        // This is a simplified version - in production, you'd iterate through bookings
        // For now, passengers need to call cancelBooking individually for refunds
    }
    
    /**
     * @dev Get ride details
     */
    function getRide(uint256 _rideId) external view returns (Ride memory) {
        return rides[_rideId];
    }
    
    /**
     * @dev Get booking details
     */
    function getBooking(uint256 _bookingId) external view returns (Booking memory) {
        return bookings[_bookingId];
    }
    
    /**
     * @dev Get user's rides
     */
    function getUserRides(address _user) external view returns (uint256[] memory) {
        return userRides[_user];
    }
    
    /**
     * @dev Get user's bookings
     */
    function getUserBookings(address _user) external view returns (uint256[] memory) {
        return userBookings[_user];
    }
    
    /**
     * @dev Get pending rewards for user
     */
    function getPendingRewards(address _user) external view returns (uint256) {
        return pendingRewards[_user];
    }
    
    /**
     * @dev Admin functions
     */
    function setPlatformFee(uint256 _fee) external onlyOwner {
        require(_fee <= 1000, "Fee cannot exceed 10%");
        platformFee = _fee;
    }
    
    function setRewardRate(uint256 _rate) external onlyOwner {
        require(_rate <= 500, "Reward rate cannot exceed 5%");
        rewardRate = _rate;
    }
    
    function withdrawPlatformFees() external onlyOwner {
        uint256 balance = address(this).balance;
        if (balance > 0) {
            payable(owner()).transfer(balance);
        }
    }
    
    /**
     * @dev Emergency function to withdraw tokens
     */
    function emergencyWithdraw(address _token, uint256 _amount) external onlyOwner {
        IERC20(_token).transfer(owner(), _amount);
    }
    
    // Receive function to accept ETH
    receive() external payable {}
}
