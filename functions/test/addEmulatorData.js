const {initializeApp, applicationDefault} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");

const {getTicket} = require("./ticketAnswers");

initializeApp({
  credential: applicationDefault(),
});

const db = getFirestore();

function getTestData(i) {
  return {
    firstName: `${i}_First_Name`,
    lastName: `${i}_Last_Name`,
    email: `${i}_email@gmail.com`,
    phoneNumber: `${i}_phoneNumber`,
    lineId: `${i}_lineId`,

    city: `${i}_city`,
    country: `${i}_country`,
    province: `${i}_province`,
    street: `${i}_street`,
    zipcode: `${i}_zipcode`,
  };
}

const TEST_DATA_1 = getTestData(1);
const TEST_DATA_2 = getTestData(2);
const TEST_DATA_3 = getTestData(3);
const TEST_DATA_4 = getTestData(4);
const TEST_DATA_5 = getTestData(5);

function getOrderAnswers(
  first,
  second,
  firstSubscribe,
  secondSubscribe,
  referralMethods
) {
  const answers = [
    first.phoneNumber,
    first.lineId,
    firstSubscribe ? "true" : "",
    second?.firstName ? second.firstName : "",
    second?.lastName ? second.lastName : "",
    second?.email ? second.email : "",
    secondSubscribe ? "true" : "",
    second?.phoneNumber ? second.phoneNumber : "",
    second?.lineId ? second.lineId : "",
    "true",
    referralMethods || referralMethods,
  ];
  return answers.join(",");
}

const preRegisteredOrder = {
  amount: "600",
  createdAt: "2022-12-12T06:56:30.864Z",
  discountCode: null,
  donation: "100",
  eventTitle: "Test LYF Form 2023",
  tickets: JSON.stringify([
    getTicket("Pre-Registered Camper", 600, {
      firstName: "Preregistered",
      lastName: "Prelastname",
      email: "email",
      birthdate: "2000-01-01",
      gender: ["Male/Man", "Something Else"],
      genderOther: "Questioning",
      pronouns: "he/him/his",
      attendedCamp: "true",
      med: "Super long blurb about many possible things.",
      diet: undefined,
      grade: "12",
      shirt: "L",
      additionalNotes: "Wow additional notes",
      born: "Prefer not to say",
      bornOther: undefined,
      ethnicity: ["Taiwanese", "Chinese", "Japanese", "Other"],
      ethnicityOther: undefined,
      generation: "Prefer not to say",
      mandarin: "None",
      mandarinOther: undefined,
      hokkien: "Other",
      hokkienOther: "Stil learning",
      hakka: "Fluent",
      hakkaOther: undefined,
      otherLanguage: undefined,
      background: "Some background",
    }),
  ]),
  totalTickets: "1",

  // Needs to be associated with TEST_DATA and orderAnswers
};

async function main() {
  const campRef = db.collection("camps").doc("2023");
  await campRef.set({
    year: 2023,
    preRegistrationFee: 500,
    registrationFee: 1100,
    siblingDiscount: 80,
  });

  // Add an order where the family already exists. And the second parent doesn't exist but also doesn't have an email.
  const familyRef = await db.collection("families").add({
    street: "fakeStreet",
    suite: "fakeSuite",
    city: "fakeCity",
    state: "fakeState",
    zipcode: "fakeZipcode",
    emails: [TEST_DATA_3.email],
  });

  await familyRef.collection("parents").doc(TEST_DATA_3.email).set({
    email: "Test",
    firstName: "Test",
    lastName: "Test",
    phoneNumber: "Test",
    lineId: "Test",
  });

  const camperRef = await familyRef.collection("campers").add({
    firstName: "Preregistered",
    lastName: "Prelastname",
    email: "override",
    birthDate: "2000-02-03",
  });

  // Add a pre-registration order that uses the family defined above.
  await campRef.collection("registrations").add({
    camper: camperRef,
    isPreRegistration: true,
  });

  // Add a pre-registration order with camp credit.
  await db.collection("credits").doc(familyRef.id).set({
    amountRemaining: 800,
    notes: [],
    family: familyRef
  })

  const {amount, discountCode, ...preRegisteredOrderWithoutAmount} = preRegisteredOrder

  await db.collection("zeffy-orders").add({
    amount: "0",
    discountCode: "code800",
    ...preRegisteredOrderWithoutAmount,
    orderAnswers: getOrderAnswers(
      TEST_DATA_3,
      undefined,
      false,
      false,
      "TACL-LYF Camper"
    ),
    ...TEST_DATA_3,
  });
}

// families/AblovjednHCtNwWwkTj1/campers/WZhuT20MApaLjffgFdsj
async function testMigratedData() {
  await db.collection("zeffy-orders").add({
    amount: "600",
    createdAt: "2022-12-12T06:56:30.864Z",
    discountCode: "FREE",
    donation: "0",
    eventTitle: "LYF 2023: The Greatest Show",
    orderAnswers: getOrderAnswers(
      TEST_DATA_1,
      TEST_DATA_2,
      true,
      false,
      "TACL-LYF Counselor,Other Taiwanese Organization"
    ),
    tickets: JSON.stringify([
      getTicket("Pre-Registered Camper", 600, {
        firstName: "Tarron",
        lastName: "Lai",
        email: "email",
        birthdate: "2005-12-19",
        gender: ["Male/Man"],
        genderOther: undefined,
        pronouns: "he/him/his",
        attendedCamp: "true",
        med: "Super long blurb about many possible things.",
        diet: undefined,
        grade: "12",
        shirt: "L",
        additionalNotes: "Wow additional notes",
        born: "Prefer not to say",
        bornOther: undefined,
        ethnicity: ["Taiwanese", "Chinese", "Japanese", "Other"],
        ethnicityOther: undefined,
        generation: "Prefer not to say",
        mandarin: "None",
        mandarinOther: undefined,
        hokkien: "Other",
        hokkienOther: "Stil learning",
        hakka: "Fluent",
        hakkaOther: undefined,
        otherLanguage: undefined,
        background: "Some background",
      }),
    ]),
    totalTickets: "1",

    firstName: "Hock",
    lastName: "Lai",
    email: "hock.lai@gmail.com",
    city: "1_city",
    country: "1_country",
    province: "1_province",
    street: "1_street",
    zipcode: "1_zipcode",
  });
}

main()
  .then(() => {
    console.log("Finished adding");
  })
  .catch(() => {
    console.log("Failed.");
  });

// At the end we expect:
// - 1 camp
// - 5 registrations (3 full, 1 pre-registration, 1 failed)
// - 3 families
//    - 1 with two campers
//    - 1 with one camper
//    - 1 with one camper
// - 4 zeffy orders