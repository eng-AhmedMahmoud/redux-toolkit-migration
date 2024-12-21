
/**
 * Attachment Data interface
 */
export interface AttachmentData{
    /**
     * attachment url
     */
    url: string;
    /**
     * attachment name
     */
    name: string;
}

/**
 * Brand Interface
 */
export interface Brand
    {
        /**
         * brand key
         */
        name: string;
        /**
         * brand value
         */
        value: string;

}

/**
 * The offering price
 */
export interface OfferingPrice{
    /**
     * priceType (max)
     */
    priceType: string;
    /**
     * price
     */
    price: {
        /**
         * price value
         */
        value: number;
        /**
         * price unit (currency)
         */
        unit: string;
    };
}
/**
 * Device interface
 * This represents the keys used for
 * displaying the selected trade-in device card
 */
export interface Device {
    /**
     * id
     */
    id: string;
    /**
     * name
     */
    name: string;
    /**
     * max price value
     */
    maxPrice: number;
    /**
     * formatted price string with currency
     */
    formattedPrice: string;
    /**
     * image src
     */
    imgSrc: string;
}
/**
 * API Response interface
 */
export interface ApiResponse<T> {
    /**
     * HTTP status code
     */
    status: number;
    /**
     * HTTP status text
     */
    statusText: string;
    /**
     * HTTP headers
     */
    headers?: Headers;
    /**
     * Response body
     */
    body: T;
}

/**
 * ApiDevice (data model returned from API)
 */
export interface ApiDevice {
    /**
     * name
     */
    name: string;
    /**
     * id
     */
    id: string;
    /**
     * prodSpecCharValueUse (brand)
     */
    prodSpecCharValueUse:Brand[];
    /**
     * productOfferingPrice (price)
     */
    productOfferingPrice: OfferingPrice[];
    /**
     * attachment
     */
    attachment: AttachmentData[];
}
