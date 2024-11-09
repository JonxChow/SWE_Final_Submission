export async function getPublicHolidays() {
    const datasetId = "d_4e19214c3a5288eab7a27235f43da4fa";
    const url = "https://data.gov.sg/api/action/datastore_search?resource_id=" + datasetId;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Response not OK ' + response.statusText);
        }
        const data = await response.json(); // Parse JSON response
        console.log(data.result.records);
        return data.result.records; // Return the data
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // Rethrow the error so it can be caught by the caller
    }
}


export function checkHoliday(holidays) {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Check if today is a public holiday
    return holidays.find(holiday => holiday.date === today);
}


export function calculatePrice(holidays) {
    // Base price and scaling factor for holidays
    const BASE = 36;
    const FACTOR = 2;

    return (checkHoliday(holidays)) ? BASE * FACTOR : BASE;
}