import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VehicleService } from 'src/services/vehicle/vehicle.service';
import { errorMapping } from 'src/services/vehicle/vehicle.error-mapping';
import { Vehicle } from 'src/services/vehicle/model/vehicle.model';

type ButtonTitle = 'Cadastrar veículo' | 'Editar veículo';

@Component({
  selector: 'form-vehicle',
  styleUrls: ['./form-vehicle.component.scss'],
  templateUrl: './form-vehicle.component.html',
})
export class CreateVehicleComponent implements OnInit {
  buttonTitle: ButtonTitle = 'Cadastrar veículo';
  loadingVehicle = false;
  vehicleToEdit: Vehicle | null = null;
  actionType: 'create' | 'edit' = 'create';
  minYear = 0;
  maxYear = new Date().getFullYear() + 1;
  formBuilder = new FormBuilder();
  vehicleForm = this.formBuilder.nonNullable.group({
    model: ['', [Validators.required]],
    brand: ['', [Validators.required]],
    year: [
      new Date().getFullYear(),
      [
        Validators.required,
        Validators.min(this.minYear),
        Validators.max(this.maxYear),
      ],
    ],
    plate: ['', [Validators.required, Validators.min(7), Validators.max(7)]],
    chassis: [
      '',
      [Validators.required, Validators.min(17), Validators.max(17)],
    ],
    renavam: [
      '',
      [Validators.required, Validators.minLength(11), Validators.maxLength(11)],
    ],
  });
  matcher = new ErrorStateMatcher();

  constructor(
    private vehicleService: VehicleService,
    private matSnackBar: MatSnackBar
  ) {}

  ngOnInit() {}

  onClickSwitchToEdit() {
    this.actionType = 'edit';
    this.buttonTitle = 'Editar veículo';
    this.vehicleToEdit = null;
    this.vehicleForm.reset();
  }

  onClickSwitchToCreate() {
    this.actionType = 'create';
    this.buttonTitle = 'Cadastrar veículo';
    this.vehicleToEdit = null;
    this.vehicleForm.reset();
  }

  onGetVehicle() {
    if (this.vehicleForm.getRawValue().plate.length !== 7) {
      this.matSnackBar.open('Formulário inválido', 'Fechar', {});
      return;
    }

    this.vehicleService.getVehicle({
      plate: this.vehicleForm.getRawValue().plate,
    });

    this.vehicleService.observableVehicle.subscribe((vehicle) => {
      if (!vehicle) {
        return;
      }

      this.vehicleToEdit = vehicle;
      this.vehicleForm.patchValue(vehicle);
    });

    this.vehicleService.observableLoadingVehicles.subscribe((loading) => {
      this.loadingVehicle = loading;
    });
  }

  onSubmit() {
    if (!this.vehicleForm.valid) {
      this.matSnackBar.open('Formulário inválido', 'Fechar', {});
      return;
    }

    const actions = {
      create: () =>
        this.vehicleService.createVehicle(this.vehicleForm.getRawValue()),
      edit: () =>
        this.vehicleService.editVehicle(this.vehicleForm.getRawValue()),
    };

    if (!(this.actionType in actions)) {
      return;
    }
    actions[this.actionType]();

    this.vehicleService.observableError.subscribe((error) => {
      if (error) {
        this.matSnackBar.open(
          errorMapping.statusCode[error.statusCode][error.message] ||
            errorMapping.default,
          'Fechar',
          {}
        );
      }
    });
  }
}
