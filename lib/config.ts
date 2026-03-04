export const Messages = {
  error1: "Something went wrong!",
  error2: "Please login first!",
  error3: "Please fulfill all inputs!",
  error4: "Message is empty!",
  error5: "Only images with jpeg, jpg, png format allowed!",
};

export const propertySquare = [0, 25, 50, 75, 100, 125, 150, 200, 300, 500];

export const roomOptions = [1, 2, 3, 4, 5];
export const bedOptions = [1, 2, 3, 4, 5];

export const topPropertyRank = 2;

const thisYear = new Date().getFullYear();

export const propertyYears: any = [];

for (let i = 1970; i <= thisYear; i++) {
  propertyYears.push(String(i));
}
