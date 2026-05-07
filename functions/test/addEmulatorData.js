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

  // Add a basic order.
  // await db.collection("zeffy-orders").add({
  //   amount: "1100",
  //   createdAt: "2022-12-12T06:56:30.864Z",
  //   discountCode: "FREE",
  //   donation: "0",
  //   eventTitle: "Test LYF Form 2023",
  //   orderAnswers: getOrderAnswers(
  //     TEST_DATA_1,
  //     TEST_DATA_2,
  //     false,
  //     true,
  //     "TACL-LYF Counselor,Other Taiwanese Organization"
  //   ),
  //   tickets: `[{'id': '1f318c82-fcf9-47e8-bfaf-bd1f05f3f790', 'ticketTitle': 'Camper', 'ticketPrice': 1100, 'qrsPng': 'https://simplyk-bucket-production.s3.amazonaws.com/organizations/e/1/5/4/e-ticket/tickets-f52a2806-bb32-4385-b977-7fc10bd88a63.pdf', 'qrsSeat': 1, 'ticketAnswers': [{'id': '85bd32d5-5aa5-4c16-9374-e559f3b80168', 'questionId': '85bd32d5-5aa5-4c16-9374-e559f3b80168', 'answer': ['No']}, {'id': 'a505b2d2-4b47-47c0-bbd9-35101b2480a4', 'questionId': 'a505b2d2-4b47-47c0-bbd9-35101b2480a4', 'answer': ['Name']}, {'id': '786352d2-f4cb-4a86-a90d-349cf31c07f5', 'questionId': '786352d2-f4cb-4a86-a90d-349cf31c07f5', 'answer': ['me4137@gmail.com']}, {'id': 'faa039c6-f40b-4e8b-b039-2352ae5a51c8', 'questionId': 'faa039c6-f40b-4e8b-b039-2352ae5a51c8', 'answer': ['1998-01-13']}, {'id': '6446d944-95cd-48fe-99ac-94e1c6bb1d2a', 'questionId': '6446d944-95cd-48fe-99ac-94e1c6bb1d2a', 'answer': ['Male/Man', 'Something Else']}, {'id': '12ba53fe-a053-4170-b682-f00571535d5e', 'questionId': '12ba53fe-a053-4170-b682-f00571535d5e', 'answer': ["Can't"]}, {'id': 'c0d1648c-2e15-47af-91a8-e2427cd0abf1', 'questionId': 'c0d1648c-2e15-47af-91a8-e2427cd0abf1'}, {'id': 'fda16163-cbdc-415d-9835-4cbf16673c40', 'questionId': 'fda16163-cbdc-415d-9835-4cbf16673c40'}, {'id': '39546d01-e4f2-40de-be3f-df295421129d', 'questionId': '39546d01-e4f2-40de-be3f-df295421129d'}, {'id': 'c79a9358-e9a3-488e-bf16-ba44c9f204c4', 'questionId': 'c79a9358-e9a3-488e-bf16-ba44c9f204c4', 'answer': ["Vegetarians can't eat meat"]}, {'id': 'e9c7ec60-2982-40d9-b408-3ec6973fe380', 'questionId': 'e9c7ec60-2982-40d9-b408-3ec6973fe380', 'answer': ['4']}, {'id': '505c3f49-110e-4ad0-9b1c-6ec1dc72a7b2', 'questionId': '505c3f49-110e-4ad0-9b1c-6ec1dc72a7b2', 'answer': ['XS']}, {'id': 'additionalNotes', 'questionId': 'additionalNotes'}, {'id': 'separator', 'questionId': 'separator'}, {'id': '3831aa70-dfd5-4c14-8619-6bb2a8c5b5e3', 'questionId': '3831aa70-dfd5-4c14-8619-6bb2a8c5b5e3', 'answer': ['In the US']}, {'id': 'bf9c52a2-2369-40de-a864-c9aa987e4f1a', 'questionId': 'bf9c52a2-2369-40de-a864-c9aa987e4f1a'}, {'id': '0cb2227f-0b1e-4d79-a7c4-7d02a29d4888', 'questionId': '0cb2227f-0b1e-4d79-a7c4-7d02a29d4888', 'answer': ['Taiwanese']}, {'id': 'a8e46768-419e-444c-ac08-9c598c9cb5fb', 'questionId': 'a8e46768-419e-444c-ac08-9c598c9cb5fb'}, {'id': '03f3db1f-74c7-4544-b351-b7445c2ac8ca', 'questionId': '03f3db1f-74c7-4544-b351-b7445c2ac8ca', 'answer': ['1st generation (born and raised abroad)']}, {'id': '1650ea68-e4c6-4127-864a-ec7ac891290e', 'questionId': '1650ea68-e4c6-4127-864a-ec7ac891290e', 'answer': ['None']}, {'id': '4ef8930b-cf29-4002-a7c3-f9038749eb4f', 'questionId': '4ef8930b-cf29-4002-a7c3-f9038749eb4f'}, {'id': '5c0dacd2-7176-46a0-9797-ef2b06141e51', 'questionId': '5c0dacd2-7176-46a0-9797-ef2b06141e51', 'answer': ['None']}, {'id': '2855512f-87c6-4ea6-be16-1b04dd9bf63c', 'questionId': '2855512f-87c6-4ea6-be16-1b04dd9bf63c'}, {'id': '1ef61f42-cdbd-4ef0-80b8-f68f5a4c024e', 'questionId': '1ef61f42-cdbd-4ef0-80b8-f68f5a4c024e', 'answer': ['None']}, {'id': '11f15608-6b24-4214-a4f3-2ce3b60c5df5', 'questionId': '11f15608-6b24-4214-a4f3-2ce3b60c5df5'}, {'id': '8a4ebb76-61ad-4a3b-973e-1c61467d7117', 'questionId': '8a4ebb76-61ad-4a3b-973e-1c61467d7117'}, {'id': 'ce82dcd0-cd25-437b-bf81-97ea10068cc9', 'questionId': 'ce82dcd0-cd25-437b-bf81-97ea10068cc9', 'answer': ["Another can't sorry"]}]}, null, null, null, null]`,
  //   totalTickets: "1",
  //   ...TEST_DATA_1,
  // });

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

  // await db.collection("zeffy-orders").add({
  //   amount: "1100",
  //   createdAt: "2022-12-12T06:56:30.864Z",
  //   discountCode: null,
  //   donation: "0",
  //   eventTitle: "Test LYF Form 2023",
  //   orderAnswers: getOrderAnswers(
  //     TEST_DATA_3,
  //     TEST_DATA_4,
  //     false,
  //     false,
  //     undefined
  //   ),
  //   tickets: `[{'id': '1f318c82-fcf9-47e8-bfaf-bd1f05f3f790', 'ticketTitle': 'Camper', 'ticketPrice': 1100, 'qrsPng': 'https://simplyk-bucket-production.s3.amazonaws.com/organizations/e/1/5/4/e-ticket/tickets-f52a2806-bb32-4385-b977-7fc10bd88a63.pdf', 'qrsSeat': 1, 'ticketAnswers': [{'id': '85bd32d5-5aa5-4c16-9374-e559f3b80168', 'questionId': '85bd32d5-5aa5-4c16-9374-e559f3b80168', 'answer': ['No']}, {'id': 'a505b2d2-4b47-47c0-bbd9-35101b2480a4', 'questionId': 'a505b2d2-4b47-47c0-bbd9-35101b2480a4', 'answer': ['Name']}, {'id': '786352d2-f4cb-4a86-a90d-349cf31c07f5', 'questionId': '786352d2-f4cb-4a86-a90d-349cf31c07f5', 'answer': ['me4137@gmail.com']}, {'id': 'faa039c6-f40b-4e8b-b039-2352ae5a51c8', 'questionId': 'faa039c6-f40b-4e8b-b039-2352ae5a51c8', 'answer': ['1998-01-13']}, {'id': '6446d944-95cd-48fe-99ac-94e1c6bb1d2a', 'questionId': '6446d944-95cd-48fe-99ac-94e1c6bb1d2a', 'answer': ['Male/Man', 'Something Else']}, {'id': '12ba53fe-a053-4170-b682-f00571535d5e', 'questionId': '12ba53fe-a053-4170-b682-f00571535d5e', 'answer': ["Can't"]}, {'id': 'c0d1648c-2e15-47af-91a8-e2427cd0abf1', 'questionId': 'c0d1648c-2e15-47af-91a8-e2427cd0abf1'}, {'id': 'fda16163-cbdc-415d-9835-4cbf16673c40', 'questionId': 'fda16163-cbdc-415d-9835-4cbf16673c40'}, {'id': '39546d01-e4f2-40de-be3f-df295421129d', 'questionId': '39546d01-e4f2-40de-be3f-df295421129d'}, {'id': 'c79a9358-e9a3-488e-bf16-ba44c9f204c4', 'questionId': 'c79a9358-e9a3-488e-bf16-ba44c9f204c4', 'answer': ["Vegetarians can't eat meat"]}, {'id': 'e9c7ec60-2982-40d9-b408-3ec6973fe380', 'questionId': 'e9c7ec60-2982-40d9-b408-3ec6973fe380', 'answer': ['4']}, {'id': '505c3f49-110e-4ad0-9b1c-6ec1dc72a7b2', 'questionId': '505c3f49-110e-4ad0-9b1c-6ec1dc72a7b2', 'answer': ['XS']}, {'id': 'additionalNotes', 'questionId': 'additionalNotes'}, {'id': 'separator', 'questionId': 'separator'},{'id': '3831aa70-dfd5-4c14-8619-6bb2a8c5b5e3', 'questionId': '3831aa70-dfd5-4c14-8619-6bb2a8c5b5e3', 'answer': ['In the US']}, {'id': 'bf9c52a2-2369-40de-a864-c9aa987e4f1a', 'questionId': 'bf9c52a2-2369-40de-a864-c9aa987e4f1a'}, {'id': '0cb2227f-0b1e-4d79-a7c4-7d02a29d4888', 'questionId': '0cb2227f-0b1e-4d79-a7c4-7d02a29d4888', 'answer': ['Taiwanese']}, {'id': 'a8e46768-419e-444c-ac08-9c598c9cb5fb', 'questionId': 'a8e46768-419e-444c-ac08-9c598c9cb5fb'}, {'id': '03f3db1f-74c7-4544-b351-b7445c2ac8ca', 'questionId': '03f3db1f-74c7-4544-b351-b7445c2ac8ca', 'answer': ['1st generation (born and raised abroad)']}, {'id': '1650ea68-e4c6-4127-864a-ec7ac891290e', 'questionId': '1650ea68-e4c6-4127-864a-ec7ac891290e', 'answer': ['None']}, {'id': '4ef8930b-cf29-4002-a7c3-f9038749eb4f', 'questionId': '4ef8930b-cf29-4002-a7c3-f9038749eb4f'}, {'id': '5c0dacd2-7176-46a0-9797-ef2b06141e51', 'questionId': '5c0dacd2-7176-46a0-9797-ef2b06141e51', 'answer': ['None']}, {'id': '2855512f-87c6-4ea6-be16-1b04dd9bf63c', 'questionId': '2855512f-87c6-4ea6-be16-1b04dd9bf63c'}, {'id': '1ef61f42-cdbd-4ef0-80b8-f68f5a4c024e', 'questionId': '1ef61f42-cdbd-4ef0-80b8-f68f5a4c024e', 'answer': ['None']}, {'id': '11f15608-6b24-4214-a4f3-2ce3b60c5df5', 'questionId': '11f15608-6b24-4214-a4f3-2ce3b60c5df5'}, {'id': '8a4ebb76-61ad-4a3b-973e-1c61467d7117', 'questionId': '8a4ebb76-61ad-4a3b-973e-1c61467d7117'}, {'id': 'ce82dcd0-cd25-437b-bf81-97ea10068cc9', 'questionId': 'ce82dcd0-cd25-437b-bf81-97ea10068cc9', 'answer': ["Another can't sorry"]}]}, null, null, null, null]`,
  //   totalTickets: "1",
  //   ...TEST_DATA_3,
  // });

  // Add a pre-registration order that uses the family defined above.
  await campRef.collection("registrations").add({
    camper: camperRef,
    isPreRegistration: true,
  });

  // await db.collection("zeffy-orders").add({
  //   ...preRegisteredOrder,
  //   orderAnswers: getOrderAnswers(
  //     TEST_DATA_3,
  //     undefined,
  //     false,
  //     false,
  //     "TACL-LYF Camper"
  //   ),
  //   ...TEST_DATA_3,
  // });

  // // Add a failed pre-registration order.
  // await db.collection("zeffy-orders").add({
  //   ...preRegisteredOrder,
  //   orderAnswers: getOrderAnswers(
  //     TEST_DATA_5,
  //     undefined,
  //     false,
  //     false,
  //     "TACL-LYF Camper"
  //   ),
  //   ...TEST_DATA_5,
  // });

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
    city: `${i}_city`,
    country: `${i}_country`,
    province: `${i}_province`,
    street: `${i}_street`,
    zipcode: `${i}_zipcode`,
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