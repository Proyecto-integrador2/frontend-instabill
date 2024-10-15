import axiosInstance from "./axiosInstance";

export async function postBill(PDF) {
  try {
    const { data } = await axiosInstance.post(`/api/bills/`, PDF, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  } catch (error) {
    console.error("Error uploading bill: ", error);
  }
}
