import { Component, OnInit } from '@angular/core';
import { VehicleService } from '../../services/vehicle/vehicle.service';
import { Vehicle } from '../../services/vehicle/model/vehicle.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'vehicle-list',
  templateUrl: './vehicle-list.component.html',
  styleUrls: ['./vehicle-list.component.scss'],
})
export class VehicleListComponent implements OnInit {
  title = 'Vehicle API';
  page = 1;
  limit = 10;
  vehicles: Vehicle[] = [];
  loading = false;
  message = '';
  totalItems: number | null = null;

  constructor(
    private vehicleService: VehicleService,
    private matSnackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.vehicleService.getVehicles({ page: this.page, limit: this.limit });
    this.vehicleService.observableVehicles.subscribe((vehicles) => {
      this.vehicles = vehicles;
    });
    this.vehicleService.observableLoadingVehicles.subscribe((loading) => {
      this.loading = loading;
    });
    this.vehicleService.observableTotalItems.subscribe((totalItems) => {
      if (!totalItems) {
        return;
      }

      this.totalItems = totalItems;
    });
  }

  onScroll(): void {
    if (this.totalItems && this.vehicles.length >= this.totalItems) {
      return;
    }

    this.vehicleService.getVehicles({ page: this.page++, limit: this.limit });

    this.vehicleService.observableVehicles.subscribe((vehicles) => {
      this.vehicles = vehicles;
      if (this.totalItems === this.vehicles.length) {
        this.message = 'Não há mais veículos em nosso sistema.';
      }
    });
    this.vehicleService.observableLoadingVehicles.subscribe((loading) => {
      this.loading = loading;
    });
  }

  onDelete(vehicle: Vehicle) {
    this.vehicleService.deleteVehicle({ plate: vehicle.plate });

    this.vehicleService.observableIsDeleteVehicleSuccess.subscribe(
      (isSucess) => {
        if (!isSucess) {
          return;
        }

        this.matSnackBar.open('Veículo excluído com sucesso!', 'Fechar', {
          duration: 1000,
        });
      }
    );
  }
}
