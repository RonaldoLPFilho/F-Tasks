export interface ApiResponse<T> {
    status: "SUCCESS" | "ERROR",
    message: string;
    httpStatus: string;
    timeStamp: string;
    data: T;
}