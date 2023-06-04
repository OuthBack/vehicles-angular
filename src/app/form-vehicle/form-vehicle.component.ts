import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VehicleService } from 'src/services/vehicle/vehicle.service';
import { errorMapping } from 'src/services/vehicle/vehicle.error-mapping';

@Component({
  selector: 'form-vehicle',
  styleUrls: ['./form-vehicle.component.scss'],
  templateUrl: './form-vehicle.component.html',
})
export class CreateVehicleComponent implements OnInit {
  actionType: 'create' | 'edit' = 'create';
  minYear = 0;
  maxYear = new Date().getFullYear() + 1;
  formBuilder = new FormBuilder();
  vehicleForm = this.formBuilder.nonNullable.group({
    model: ['', [Validators.required, Validators.nullValidator]],
    brand: ['', [Validators.required]],
    year: [
      new Date().getFullYear(),
      [
        Validators.required,
        Validators.min(this.minYear),
        Validators.max(this.maxYear),
      ],
    ],
    plate: ['', [Validators.required]],
    chassis: ['', [Validators.required]],
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
  }

  onClickSwitchToCreate() {
    this.actionType = 'create';
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

    this.vehicleService.overservableError.subscribe((error) => {
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
