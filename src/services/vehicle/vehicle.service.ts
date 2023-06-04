import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Vehicle } from './model/vehicle.model';

type GetVehicleArgs = { plate: string };

type GetVehicleResponse = { vehicle: Vehicle };

type GetVehiclesArgs = {
  page: number;
  limit: number;
};

type GetVehiclesResponse = {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
  vehicles: Vehicle[];
};

type CreateVehicleArgs = Omit<Vehicle, 'id'>;
type CreateVehicleResponse = { vehicle: Vehicle };

type UpdateVehicleArgs = Omit<Vehicle, 'id'>;
type UpdateVehicleResponse = { vehicle: Vehicle };

type DeleteVehicleArgs = { plate: string };

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private loadingVehicle = new BehaviorSubject(false);
  private loadingVehicles = new BehaviorSubject(false);
  private vehicle = new BehaviorSubject<Vehicle | null>(null);
  private vehicles = new BehaviorSubject<Vehicle[]>([]);
  private totalItems = new BehaviorSubject<number | null>(null);
  private error = new BehaviorSubject<{
    statusCode: number;
    message: string;
  } | null>(null);
  observableLoadingVehicles = this.loadingVehicles.asObservable();
  observableVehicle = this.vehicle.asObservable();
  observableVehicles = this.vehicles.asObservable();
  observableTotalItems = this.totalItems.asObservable();
  observableError = this.error.asObservable();

  constructor(private http: HttpClient) {}

  getVehicle({ plate }: GetVehicleArgs) {
    this.loadingVehicle.next(true);
    const response = this.http.get(
      `/api/vehicle/${plate}`
    ) as Observable<GetVehicleResponse>;

    response.subscribe({
      next: ({ vehicle }) => {
        this.loadingVehicle.next(false);
        if (!vehicle) {
          this.error.next({
            message: 'Placa do veículo não encontrada.',
            statusCode: 400,
          });
          return;
        }
        this.vehicle.next(vehicle);
      },
      error: (error) => {
        this.error.next({
          message: error.error.message,
          statusCode: error.status,
        });
        this.error.next(null);
      },
    });
  }
  getVehicles({ page, limit }: GetVehiclesArgs) {
    this.loadingVehicles.next(true);
    const response = this.http.get('/api/vehicle', {
      params: { page, limit },
    }) as Observable<GetVehiclesResponse>;

    response.subscribe({
      next: ({ vehicles, totalItems }) => {
        this.loadingVehicles.next(false);
        this.vehicles.next([...this.vehicles.value, ...vehicles]);
        this.totalItems.next(totalItems);
      },
      error: (error) => {
        this.error.next({
          message: error.error.message,
          statusCode: error.status,
        });
        this.error.next(null);
      },
    });
  }

  createVehicle(vehicle: CreateVehicleArgs) {
    const response = this.http.post(
      '/api/vehicle',
      vehicle
    ) as Observable<CreateVehicleResponse>;

    response.subscribe({
      next: ({ vehicle }) =>
        this.vehicles.next([vehicle, ...this.vehicles.value]),
      error: (error) => {
        this.error.next({
          message: error.error.message,
          statusCode: error.status,
        });
        this.error.next(null);
      },
    });

    return this.vehicles;
  }

  editVehicle({ plate, ...vehicle }: UpdateVehicleArgs) {
    const response = this.http.put(
      `/api/vehicle/${plate}`,
      vehicle
    ) as Observable<UpdateVehicleResponse>;

    response.subscribe({
      next: ({ vehicle }) => {
        const value = [...this.vehicles.value];
        const index = value.findIndex(({ id }) => id === vehicle.id);

        value[index] = vehicle;
        this.vehicles.next(value);
      },
      error: (error) => {
        this.error.next({
          message: error.error.message,
          statusCode: error.status,
        });
        this.error.next(null);
      },
    });

    return this.vehicles;
  }

  deleteVehicle({ plate }: DeleteVehicleArgs) {
    const response = this.http.delete(
      `/api/vehicle/${plate}`
    ) as Observable<CreateVehicleResponse>;

    response.subscribe({
      next: ({ vehicle }) => {
        const value = [...this.vehicles.value];
        const index = value.findIndex(({ id }) => id === vehicle.id);

        value.splice(index, 1);
        this.vehicles.next(value);
      },
      error: (error) => {
        this.error.next({
          message: error.error.message,
          statusCode: error.status,
        });
        this.error.next(null);
      },
    });

    return this.vehicles;
  }
}
