'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, addDoc, getDocs, doc, setDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

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

export default function VehiclesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    plate: '',
    currentMileage: '',
    type: 'car',
    tyres: {
      aspectRatio: '',
      brand: '',
      dateChanged: new Date().toLocaleDateString(),
      maxMileage: '',
      notes: '',
      rimDiameter: '',
      type: 'Winter Tyres',
      vehicleMileageWhenChanged: '',
      width: '',
    },
  });

  useEffect(() => {
    const fetchVehicles = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const vehiclesRef = collection(firestore, 'users', user.uid, 'vehicles');
        const querySnapshot = await getDocs(vehiclesRef);
        const vehiclesData = querySnapshot.docs.map(doc => ({
          plate: doc.id,
          ...doc.data()
        })) as Vehicle[];
        setVehicles(vehiclesData);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        toast.error('Failed to fetch vehicles');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [user]);

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const vehicleRef = doc(firestore, 'users', user.uid, 'vehicles', newVehicle.plate);
      await setDoc(vehicleRef, {
        currentMileage: newVehicle.currentMileage,
        type: newVehicle.type,
        tyres: newVehicle.tyres,
      });

      setVehicles([
        ...vehicles,
        {
          plate: newVehicle.plate,
          currentMileage: newVehicle.currentMileage,
          type: newVehicle.type,
          tyres: newVehicle.tyres,
        },
      ]);

      setNewVehicle({
        plate: '',
        currentMileage: '',
        type: 'car',
        tyres: {
          aspectRatio: '',
          brand: '',
          dateChanged: new Date().toLocaleDateString(),
          maxMileage: '',
          notes: '',
          rimDiameter: '',
          type: 'Winter Tyres',
          vehicleMileageWhenChanged: '',
          width: '',
        },
      });
      setShowAddModal(false);
      toast.success('Vehicle added successfully!');
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast.error('Failed to add vehicle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (plate: string) => {
    router.push(`/dashboard/vehicles/${plate}`);
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Vehicles</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all your vehicles and their maintenance history.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:w-auto"
          >
            Add vehicle
          </button>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                    >
                      Plate
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Current Mileage
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Tyre Brand
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Tyre Type
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {vehicles.map((vehicle) => (
                    <tr
                      key={vehicle.plate}
                      onClick={() => handleRowClick(vehicle.plate)}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {vehicle.plate}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {vehicle.type}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {vehicle.currentMileage}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {vehicle.tyres.brand}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {vehicle.tyres.type}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-medium mb-4">Add New Vehicle</h2>
            <form onSubmit={handleAddVehicle} className="space-y-4">
              <div>
                <label
                  htmlFor="plate"
                  className="block text-sm font-medium text-gray-700"
                >
                  Plate Number
                </label>
                <input
                  type="text"
                  id="plate"
                  value={newVehicle.plate}
                  onChange={(e) =>
                    setNewVehicle({ ...newVehicle, plate: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="currentMileage"
                  className="block text-sm font-medium text-gray-700"
                >
                  Current Mileage
                </label>
                <input
                  type="text"
                  id="currentMileage"
                  value={newVehicle.currentMileage}
                  onChange={(e) =>
                    setNewVehicle({ ...newVehicle, currentMileage: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="type"
                  className="block text-sm font-medium text-gray-700"
                >
                  Vehicle Type
                </label>
                <select
                  id="type"
                  value={newVehicle.type}
                  onChange={(e) =>
                    setNewVehicle({ ...newVehicle, type: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                >
                  <option value="car">Car</option>
                  <option value="truck">Truck</option>
                  <option value="motorcycle">Motorcycle</option>
                </select>
              </div>
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Tyre Information</h3>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="tyreBrand"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Brand
                    </label>
                    <input
                      type="text"
                      id="tyreBrand"
                      value={newVehicle.tyres.brand}
                      onChange={(e) =>
                        setNewVehicle({
                          ...newVehicle,
                          tyres: { ...newVehicle.tyres, brand: e.target.value },
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="tyreType"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Type
                    </label>
                    <select
                      id="tyreType"
                      value={newVehicle.tyres.type}
                      onChange={(e) =>
                        setNewVehicle({
                          ...newVehicle,
                          tyres: { ...newVehicle.tyres, type: e.target.value },
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    >
                      <option value="Winter Tyres">Winter Tyres</option>
                      <option value="Summer Tyres">Summer Tyres</option>
                      <option value="All Season Tyres">All Season Tyres</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="width"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Width
                      </label>
                      <input
                        type="text"
                        id="width"
                        value={newVehicle.tyres.width}
                        onChange={(e) =>
                          setNewVehicle({
                            ...newVehicle,
                            tyres: { ...newVehicle.tyres, width: e.target.value },
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="aspectRatio"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Aspect Ratio
                      </label>
                      <input
                        type="text"
                        id="aspectRatio"
                        value={newVehicle.tyres.aspectRatio}
                        onChange={(e) =>
                          setNewVehicle({
                            ...newVehicle,
                            tyres: { ...newVehicle.tyres, aspectRatio: e.target.value },
                          })
                        }
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor="rimDiameter"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Rim Diameter
                    </label>
                    <input
                      type="text"
                      id="rimDiameter"
                      value={newVehicle.tyres.rimDiameter}
                      onChange={(e) =>
                        setNewVehicle({
                          ...newVehicle,
                          tyres: { ...newVehicle.tyres, rimDiameter: e.target.value },
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="maxMileage"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Max Mileage
                    </label>
                    <input
                      type="text"
                      id="maxMileage"
                      value={newVehicle.tyres.maxMileage}
                      onChange={(e) =>
                        setNewVehicle({
                          ...newVehicle,
                          tyres: { ...newVehicle.tyres, maxMileage: e.target.value },
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:col-start-2 sm:text-sm"
                >
                  {loading ? 'Adding...' : 'Add Vehicle'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 