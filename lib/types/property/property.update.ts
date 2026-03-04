import {
  PropertyLocation,
  PropertyStatus,
  PropertyType,
} from "@/lib/enums/property";

export interface PropertyUpdate {
  _id: string;
  propertyType?: PropertyType;
  propertyStatus?: PropertyStatus;
  propertyLocation?: PropertyLocation;
  propertyAddress?: string;
  propertyTitle?: string;
  propertyPrice?: number;
  propertySquare?: number;
  propertyBeds?: number;
  propertyRooms?: number;
  propertyImages?: string[];
  propertyDesc?: string;
  propertyBarter?: boolean;
  propertyRent?: boolean;
  soldAt?: Date;
  deletedAt?: Date;
  constructedAt?: Date;
}
