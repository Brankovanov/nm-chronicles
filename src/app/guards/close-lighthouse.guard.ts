import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { LightHouseService } from '../layout/shared-components/light-house/light-house.service';

export const closeLightHouseGuard: CanDeactivateFn<unknown> = () => {
  const lightHouseService = inject(LightHouseService);

  if (lightHouseService.isOpen()) {
    lightHouseService.hide();
    return false;
  }

  return true;
};
