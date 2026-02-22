import { Types } from "mongoose";

export interface IPayload {
  id: Types.ObjectId;
  role: string;
  companyId: Types.ObjectId;
}