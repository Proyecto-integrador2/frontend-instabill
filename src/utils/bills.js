import axiosInstance from "./axiosInstance";

export async function postBill(JSON) {
  try {
    const { data } = await axiosInstance.post(`/api/bills/`, JSON, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("Bill uploaded successfully", data);
    return data;
  } catch (error) {
    console.error("Error uploading bill: ", error);
    throw error;
  }
}

export async function getBills() {
  try {
    const { data } = await axiosInstance.get(`/api/bills/`);
    return data;
  } catch (error) {
    console.error("Error uploading bill: ", error);
    throw error;
  }
}
