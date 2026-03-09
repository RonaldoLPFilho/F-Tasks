import api from "../../../services/AxiosInterceptor";
import { ApiResponse } from "../../../types/ApiResponse";
import { LofiRadio } from "../types/LofiRadio";

export async function getLofiRadios(): Promise<LofiRadio[]> {
  const response = await api.get<ApiResponse<LofiRadio[]>>("/lofi/radios");
  return response.data.data;
}
