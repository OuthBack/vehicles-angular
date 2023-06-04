import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroupDirective,
  Validators,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { VehicleService } from 'src/services/vehicle/vehicle.service';
import { errorMapping } from 'src/services/vehicle/vehicle.error-mapping';
import { Vehicle } from 'src/services/vehicle/model/vehicle.model';
import { ValidationErrors } from '@angular/forms';
import { validationUtils } from 'src/utils/validation.utils';

@Component({
  selector: 'form-vehicle',
  styleUrls: ['./form-vehicle.component.scss'],
  templateUrl: './form-vehicle.component.html',
})
export class CreateVehicleComponent implements OnInit {
  buttonTitle = 'Salvar';
  loadingVehicle = false;
  loadingCreateVehicle = false;
  loadingSaveVehicle = false;
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
    plate: [
      '',
      [Validators.required, Validators.minLength(7), Validators.maxLength(7)],
    ],
    chassis: ['', [Validators.required, this.chassisValidator]],
    renavam: [
      '',
      [
        Validators.required,
        Validators.minLength(11),
        Validators.maxLength(11),
        Validators.pattern(validationUtils.regex.renavam),
      ],
    ],
  });
  matcher = new ErrorStateMatcher();

  constructor(
    private vehicleService: VehicleService,
    private matSnackBar: MatSnackBar
  ) {}

  ngOnInit() {}

  private chassisValidator(
    chassis: FormControl<string>
  ): ValidationErrors | null {
    const is17Characters = chassis.value.replace(' ', '').length === 17;
    return is17Characters ? null : { minlength: true, maxlength: true };
  }

  getFirstError(controlName: string) {
    const control = this.vehicleForm.get(controlName);

    if (!control) {
      return [];
    }
    const errors = Object.keys(control.errors ?? {});
    console.log(control.errors, controlName);
    return errors.length > 0 ? errors[0] : null;
  }

  onClickSwitchToEdit() {
    this.actionType = 'edit';
    this.vehicleToEdit = null;
    console.log(this.vehicleForm.errors);
  }

  onClickSwitchToCreate() {
    this.actionType = 'create';
    this.vehicleToEdit = null;
  }

  onGetVehicle() {
    if (this.vehicleForm.getRawValue().plate.length !== 7) {
      this.matSnackBar.open('Formulário inválido', 'Fechar', {
        duration: 1000,
      });
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

    this.vehicleService.observableLoadingVehicle.subscribe((loading) => {
      this.loadingVehicle = loading;
    });
  }

  onSubmit(formDirective: FormGroupDirective) {
    if (!this.vehicleForm.valid) {
      this.matSnackBar.open('Formulário inválido', 'Fechar', {
        duration: 1000,
      });
      return;
    }

    const value = this.vehicleForm.getRawValue();
    const vehicle = { ...value, plate: value.plate.toUpperCase() };

    const actions = {
      create: () => this.vehicleService.createVehicle(vehicle),
      edit: () => this.vehicleService.editVehicle(vehicle),
    };

    if (!(this.actionType in actions)) {
      return;
    }

    this.vehicleService.observableLoadingSaveVehicle.subscribe((loading) => {
      this.loadingSaveVehicle = loading;
    });

    this.vehicleService.observableIsCreateVehicleSuccess.subscribe(
      (success) => {
        if (success) {
          this.matSnackBar.open('Veículo cadastrado com sucesso!', 'Fechar', {
            duration: 1000,
          });
          this.vehicleToEdit = null;
          formDirective.resetForm();
        }
      }
    );

    this.vehicleService.observableIsEditVehicleSuccess.subscribe((success) => {
      if (success) {
        this.matSnackBar.open('Veículo editado com sucesso!', 'Fechar', {
          duration: 1000,
        });
        this.vehicleToEdit = null;
        formDirective.resetForm();
      }
    });

    this.vehicleService.observableError.subscribe((error) => {
      if (error) {
        this.matSnackBar.open(
          errorMapping.statusCode[error.statusCode][error.message] ||
            errorMapping.default,
          'Fechar',
          {
            duration: 1000,
          }
        );
      }
    });

    actions[this.actionType]();
  }
}
