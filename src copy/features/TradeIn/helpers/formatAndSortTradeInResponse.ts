import { Device } from 'app/container/TradeIn/interfaces/api';
import { IFormSuggestInputItem } from '@vfde-brix/ws10/form-suggest-input/FormSuggestInputInterface';

const formatAndSortTradeInResponse = (devices: Device[]): IFormSuggestInputItem[] =>
    devices
        .map(device => ({ id: device.id, text: device.name! }))
        .sort((deviceA, deviceB) => deviceA.text!.localeCompare(deviceB.text!));

export default formatAndSortTradeInResponse;
