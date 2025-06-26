import { getContract, prepareContractCall, readContract } from 'thirdweb';
import { baseSepolia } from 'thirdweb/chains';
import { createThirdwebClient } from 'thirdweb';
import { CONTRACT_ADDRESSES } from '../constants/contracts';
import { supabase } from '../utils/supabase';
import { useWalletStore } from '../store/walletStore';

// Initialize Thirdweb client
const client = createThirdwebClient({
  clientId: process.env.EXPO_PUBLIC_THIRDWEB_CLIENT_ID as string,
});

// Proper ABI definitions for thirdweb v5
const TOKEN_ABI = [
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [{ type: "bool" }],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "decimals",
    inputs: [],
    outputs: [{ type: "uint8" }],
    stateMutability: "view"
  }
] as const;

const RIDE_SHARE_ABI = [
  {
    type: "function",
    name: "createRide",
    inputs: [
      { name: "_startLocation", type: "string" },
      { name: "_endLocation", type: "string" },
      { name: "_departureTime", type: "uint256" },
      { name: "_pricePerSeat", type: "uint256" },
      { name: "_totalSeats", type: "uint8" },
      { name: "_paymentMethod", type: "uint8" }
    ],
    outputs: [{ type: "uint256" }],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "bookRide",
    inputs: [
      { name: "_rideId", type: "uint256" },
      { name: "_seatsToBook", type: "uint8" }
    ],
    outputs: [{ type: "uint256" }],
    stateMutability: "payable"
  },
  {
    type: "function",
    name: "completeRide",
    inputs: [{ name: "_rideId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "completeBooking",
    inputs: [{ name: "_bookingId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "cancelRide",
    inputs: [
      { name: "_rideId", type: "uint256" },
      { name: "_reason", type: "string" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "cancelBooking",
    inputs: [
      { name: "_bookingId", type: "uint256" },
      { name: "_reason", type: "string" }
    ],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "claimRewards",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "getRide",
    inputs: [{ name: "_rideId", type: "uint256" }],
    outputs: [
      { type: "uint256" }, { type: "address" }, { type: "string" }, 
      { type: "string" }, { type: "uint256" }, { type: "uint256" }, 
      { type: "uint8" }, { type: "uint8" }, { type: "uint8" }, { type: "bool" }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getBooking",
    inputs: [{ name: "_bookingId", type: "uint256" }],
    outputs: [
      { type: "uint256" }, { type: "uint256" }, { type: "address" }, 
      { type: "uint8" }, { type: "uint256" }, { type: "bool" }
    ],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getUserRides",
    inputs: [{ name: "_user", type: "address" }],
    outputs: [{ type: "uint256[]" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getUserBookings",
    inputs: [{ name: "_user", type: "address" }],
    outputs: [{ type: "uint256[]" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "getPendingRewards",
    inputs: [{ name: "_user", type: "address" }],
    outputs: [{ type: "uint256" }],
    stateMutability: "view"
  }
] as const;

// Contract instances
const crydaTokenContract = getContract({
  client,
  chain: baseSepolia,
  address: CONTRACT_ADDRESSES.CRYDA_TOKEN,
  abi: TOKEN_ABI,
});

const rideShareContract = getContract({
  client,
  chain: baseSepolia,
  address: CONTRACT_ADDRESSES.RIDE_SHARE,
  abi: RIDE_SHARE_ABI,
});

// Types
export interface CreateRideData {
  startLocation: string;
  endLocation: string;
  departureTime: Date;
  pricePerSeat: string;
  totalSeats: number;
  paymentMethod: 'ETH' | 'CRYDA_TOKEN';
}

export interface BookRideData {
  rideId: number;
  seatsToBook: number;
  totalAmount: string;
  paymentMethod: 'ETH' | 'CRYDA_TOKEN';
}

// Utility functions
const paymentMethodToEnum = (method: 'ETH' | 'CRYDA_TOKEN'): number => {
  return method === 'ETH' ? 0 : 1;
};

const weiToEth = (wei: bigint): string => {
  return (Number(wei) / 1e18).toString();
};

const ethToWei = (eth: string): bigint => {
  return BigInt(Math.floor(parseFloat(eth) * 1e18));
};

/**
 * Blockchain Service for Ride Sharing
 */
export class BlockchainService {
  
  /**
   * Create a ride on the blockchain
   */
  static async createRide(rideData: CreateRideData) {
    try {
      const departureTimestamp = Math.floor(rideData.departureTime.getTime() / 1000);
      const priceInWei = ethToWei(rideData.pricePerSeat);
      const paymentMethodEnum = paymentMethodToEnum(rideData.paymentMethod);
      
      const transaction = prepareContractCall({
        contract: rideShareContract,
        method: "createRide",
        params: [
          rideData.startLocation,
          rideData.endLocation,
          BigInt(departureTimestamp),
          priceInWei,
          rideData.totalSeats,
          paymentMethodEnum,
        ],
      });
      
      return transaction;
    } catch (error) {
      console.error('Error creating ride on blockchain:', error);
      throw error;
    }
  }
  
  /**
   * Book a ride on the blockchain
   */
  static async bookRide(bookingData: BookRideData) {
    try {
      const totalAmountWei = ethToWei(bookingData.totalAmount);
      
      if (bookingData.paymentMethod === 'ETH') {
        // ETH payment
        const transaction = prepareContractCall({
          contract: rideShareContract,
          method: "bookRide",
          params: [
            BigInt(bookingData.rideId),
            bookingData.seatsToBook,
          ],
          value: totalAmountWei,
        });
        
        return transaction;
      } else {
        // CRYDA token payment - need approval first
        const approveTransaction = prepareContractCall({
          contract: crydaTokenContract,
          method: "approve",
          params: [CONTRACT_ADDRESSES.RIDE_SHARE, totalAmountWei],
        });
        
        const bookTransaction = prepareContractCall({
          contract: rideShareContract,
          method: "bookRide",
          params: [
            BigInt(bookingData.rideId),
            bookingData.seatsToBook,
          ],
        });
        
        return {
          approveTransaction,
          bookTransaction,
        };
      }
    } catch (error) {
      console.error('Error booking ride on blockchain:', error);
      throw error;
    }
  }
  
  /**
   * Complete a ride
   */
  static async completeRide(rideId: number) {
    try {
      const transaction = prepareContractCall({
        contract: rideShareContract,
        method: "completeRide",
        params: [BigInt(rideId)],
      });
      
      return transaction;
    } catch (error) {
      console.error('Error completing ride:', error);
      throw error;
    }
  }
  
  /**
   * Complete a booking
   */
  static async completeBooking(bookingId: number) {
    try {
      const transaction = prepareContractCall({
        contract: rideShareContract,
        method: "completeBooking",
        params: [BigInt(bookingId)],
      });
      
      return transaction;
    } catch (error) {
      console.error('Error completing booking:', error);
      throw error;
    }
  }
  
  /**
   * Cancel a ride
   */
  static async cancelRide(rideId: number, reason: string) {
    try {
      const transaction = prepareContractCall({
        contract: rideShareContract,
        method: "cancelRide",
        params: [BigInt(rideId), reason],
      });
      
      return transaction;
    } catch (error) {
      console.error('Error cancelling ride:', error);
      throw error;
    }
  }
  
  /**
   * Cancel a booking
   */
  static async cancelBooking(bookingId: number, reason: string) {
    try {
      const transaction = prepareContractCall({
        contract: rideShareContract,
        method: "cancelBooking",
        params: [BigInt(bookingId), reason],
      });
      
      return transaction;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    }
  }
  
  /**
   * Claim rewards
   */
  static async claimRewards() {
    try {
      const transaction = prepareContractCall({
        contract: rideShareContract,
        method: "claimRewards",
        params: [],
      });
      
      return transaction;
    } catch (error) {
      console.error('Error claiming rewards:', error);
      throw error;
    }
  }
  
  /**
   * Read contract data
   */
  
  static async getRide(rideId: number) {
    try {
      const ride = await readContract({
        contract: rideShareContract,
        method: "getRide",
        params: [BigInt(rideId)],
      });
      
      return ride;
    } catch (error) {
      console.error('Error getting ride:', error);
      throw error;
    }
  }
  
  static async getBooking(bookingId: number) {
    try {
      const booking = await readContract({
        contract: rideShareContract,
        method: "getBooking",
        params: [BigInt(bookingId)],
      });
      
      return booking;
    } catch (error) {
      console.error('Error getting booking:', error);
      throw error;
    }
  }
  
  static async getUserRides(userAddress: string) {
    try {
      const rideIds = await readContract({
        contract: rideShareContract,
        method: "getUserRides",
        params: [userAddress],
      });
      
      return rideIds;
    } catch (error) {
      console.error('Error getting user rides:', error);
      throw error;
    }
  }
  
  static async getUserBookings(userAddress: string) {
    try {
      const bookingIds = await readContract({
        contract: rideShareContract,
        method: "getUserBookings",
        params: [userAddress],
      });
      
      return bookingIds;
    } catch (error) {
      console.error('Error getting user bookings:', error);
      throw error;
    }
  }
  
  static async getPendingRewards(userAddress: string) {
    try {
      const rewards = await readContract({
        contract: rideShareContract,
        method: "getPendingRewards",
        params: [userAddress],
      });
      
      return weiToEth(rewards as bigint);
    } catch (error) {
      console.error('Error getting pending rewards:', error);
      throw error;
    }
  }
  
  static async getCrydaBalance(userAddress: string) {
    try {
      const balance = await readContract({
        contract: crydaTokenContract,
        method: "balanceOf",
        params: [userAddress],
      });
      
      return weiToEth(balance as bigint);
    } catch (error) {
      console.error('Error getting CRYDA balance:', error);
      throw error;
    }
  }
}

/**
 * Supabase integration for storing blockchain data
 */
export class SupabaseIntegration {
  
  /**
   * Create ride in Supabase and get ID for blockchain
   */
  static async createRideRecord(rideData: CreateRideData & { 
    driverName: string;
    carType: string;
    numberPlate: string;
  }) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('rides')
        .insert({
          driver_id: session.user.id,
          start_location_label: rideData.startLocation,
          end_location_label: rideData.endLocation,
          departure_time: rideData.departureTime.toISOString(),
          price_per_seat: parseFloat(rideData.pricePerSeat),
          total_seats: rideData.totalSeats,
          payment_method: rideData.paymentMethod,
          driver_name: rideData.driverName,
          car_type: rideData.carType,
          number_plate: rideData.numberPlate,
          status: 'active',
        })
        .select('id')
        .single();
      
      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error creating ride record:', error);
      throw error;
    }
  }
  
  /**
   * Update ride with blockchain data
   */
  static async updateRideWithBlockchainData(
    supabaseId: number, 
    blockchainId: number, 
    txHash: string
  ) {
    try {
      const { error } = await supabase
        .from('rides')
        .update({
          blockchain_id: blockchainId,
          blockchain_tx_hash: txHash,
        })
        .eq('id', supabaseId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error updating ride with blockchain data:', error);
      throw error;
    }
  }
  
  /**
   * Create booking record
   */
  static async createBookingRecord(
    rideId: number,
    seatsBooked: number,
    totalAmount: string,
    paymentMethod: 'ETH' | 'CRYDA_TOKEN'
  ) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          ride_id: rideId,
          passenger_id: session.user.id,
          seats_booked: seatsBooked,
          total_amount: parseFloat(totalAmount),
          payment_method: paymentMethod,
          status: 'active',
        })
        .select('id')
        .single();
      
      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error creating booking record:', error);
      throw error;
    }
  }
  
  /**
   * Update booking with blockchain data
   */
  static async updateBookingWithBlockchainData(
    supabaseId: number,
    blockchainId: number,
    txHash: string
  ) {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          blockchain_id: blockchainId,
          blockchain_tx_hash: txHash,
        })
        .eq('id', supabaseId);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error updating booking with blockchain data:', error);
      throw error;
    }
  }
}
