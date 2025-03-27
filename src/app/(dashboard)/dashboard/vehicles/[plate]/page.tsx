'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { toast } from 'react-toastify';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

interface Tyre {
  aspectRatio: string;
  brand: string;
  dateChanged: string;
  maxMileage: string;
  notes: string;
  rimDiameter: string;
  type: string;
  vehicleMileageWhenChanged: string;
  width: string;
}

interface Vehicle {
  plate: string;
  currentMileage: string;
  type: string;
  tyres: Tyre;
}

// Create a loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

// Create the main component
function VehicleDetailsContent() {
  const { user } = useAuth();
  const params = useParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Component mounted');
    console.log('User state:', user);
    console.log('Params:', params);

    const fetchVehicle = async () => {
      console.log('Fetch vehicle function called');
      
      if (!user) {
        console.log('No user found');
        return;
      }

      if (!params.plate) {
        console.log('No plate number found in params');
        return;
      }

      try {
        const plate = params.plate as string;
        console.log('Fetching vehicle with plate:', plate);
        console.log('User ID:', user.uid);
        
        const vehicleRef = doc(firestore, 'users', user.uid, 'vehicles', plate);
        console.log('Vehicle reference path:', vehicleRef.path);
        
        const vehicleDoc = await getDoc(vehicleRef);
        console.log('Vehicle document exists:', vehicleDoc.exists());
        
        if (vehicleDoc.exists()) {
          const data = vehicleDoc.data();
          console.log('Vehicle data:', data);
          
          setVehicle({
            plate: vehicleDoc.id,
            ...data
          } as Vehicle);
        } else {
          console.log('Vehicle not found in Firestore');
          toast.error('Vehicle not found');
        }
      } catch (error) {
        console.error('Error fetching vehicle:', error);
        toast.error('Failed to fetch vehicle details');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [user, params.plate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!vehicle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Vehicle Not Found</h1>
        <Link
          href="/dashboard/vehicles"
          className="text-primary hover:text-primary/80"
        >
          Back to Vehicles
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link
          href="/dashboard/vehicles"
          className="text-primary hover:text-primary/80 flex items-center"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Vehicles
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Vehicle Details
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Plate Number</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {vehicle.plate}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Vehicle Type</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {vehicle.type}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Current Mileage</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {vehicle.currentMileage}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Tyre Information
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Brand</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {vehicle.tyres.brand}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Type</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {vehicle.tyres.type}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Size</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {vehicle.tyres.width}/{vehicle.tyres.aspectRatio}R{vehicle.tyres.rimDiameter}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Date Changed</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {vehicle.tyres.dateChanged}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Max Mileage</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {vehicle.tyres.maxMileage}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Mileage When Changed</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {vehicle.tyres.vehicleMileageWhenChanged}
              </dd>
            </div>
            {vehicle.tyres.notes && (
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Notes</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {vehicle.tyres.notes}
                </dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}

// Export the dynamically loaded component with no SSR
export default dynamic(() => Promise.resolve(VehicleDetailsContent), {
  ssr: false,
  loading: () => <LoadingSpinner />
}); 