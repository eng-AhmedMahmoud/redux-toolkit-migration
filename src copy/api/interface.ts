import { SalesChannel } from '@vfde-sails/constants';

/**
 * get Hardware Detail Group Query Args
 */
export interface GetHardwareDetailGroupQueryArgs {
     /**
      * salesChannel
      */
    salesChannel: SalesChannel;
}

/**
 * Get Tariff With Hardware Query Args
 */
export interface GetTariffWithHardwareQueryArgs{
     /**
      * salesChannel
      */
     salesChannel: SalesChannel;
      /**
       * is tradeIn
       */
      isTradeIn: boolean;
}
