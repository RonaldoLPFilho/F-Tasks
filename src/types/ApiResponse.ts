export interface ApiResponse<T> {
    status: "SUCCESS" | "ERROR",
    message: string;
    httpStatus: string;
    timestamp: string;
    data: T;
}
