function getTicket(title, price, answers) {
  return {
    id: "id",
    ticketTitle: title,
    ticketPrice: price,
    qrsPng: "png",
    qrsSeat: 1,
    ticketAnswers: getTicketAnswer(answers)
  }
}

// Can't just do str || [str] because strings weird with arrays.
const optional = (str) => str ? [str] : undefined

function getTicketAnswer(answers) {
  const {
    firstName,
    lastName,
    email,
    birthdate,
    gender,
    genderOther,
    pronouns,
    attendedCamp,
    med,
    diet,
    grade,
    shirt,
    additionalNotes,
    born,
    bornOther,
    ethnicity,
    ethnicityOther,
    generation,
    mandarin,
    mandarinOther,
    hokkien,
    hokkienOther,
    hakka,
    hakkaOther,
    otherLanguage,
    background,
  } = answers;

  return [
    {
      id: "firstName",
      questionId: "firstName",
      answer: [firstName],
    },
    {
      id: "lastName",
      questionId: "lastName",
      answer: [lastName],
    },
    {
      id: "email",
      questionId: "email",
      answer: [email],
    },
    {
      id: "birthdate",
      questionId: "birthdate",
      answer: [birthdate],
    },
    {
      id: "gender",
      questionId: "gender",
      answer: gender,
    },
    {
      id: "genderOther",
      questionId: "genderOther",
      answer: optional(genderOther),
    },
    {
      id: "pronouns",
      questionId: "pronouns",
      answer: optional(pronouns),
    },
    {
      id: "attended",
      questionId: "attended",
      answer: attendedCamp ? "Yes" : "No",
    },
    {
      id: "medical",
      questionId: "medical",
      answer: optional(med),
    },
    {
      id: "diet",
      questionId: "diet",
      answer: optional(diet),
    },
    {
      id: "grade",
      questionId: "grade",
      answer: [grade],
    },
    {
      id: "shirtSize",
      questionId: "shirtSize",
      answer: [shirt],
    },
    {
      id: "additionalNotes",
      questionId: "additionalNotes",
      answer: optional(additionalNotes),
    },
    {
      id: "separator",
      questionId: "separator",
    },
    {
      id: "born",
      questionId: "born",
      answer: optional(born),
    },
    {
      id: "bornOther",
      questionId: "bornOther",
      answer: optional(bornOther),
    },
    {
      id: "ethnicity",
      questionId: "ethnicity",
      answer: ethnicity,
    },
    {
      id: "ethnicityOther",
      questionId: "ethnicityOther",
      answer: optional(ethnicityOther),
    },
    {
      id: "generation",
      questionId: "generation",
      answer: [generation],
    },
    {
      id: "mandarin",
      questionId: "mandarin",
      answer: [mandarin],
    },
    {
      id: "mandarinOther",
      questionId: "mandarinOther",
      answer: optional(mandarinOther),
    },
    {
      id: "hokkien",
      questionId: "hokkien",
      answer: [hokkien],
    },
    {
      id: "hokkienOther",
      questionId: "hokkienOther",
      answer: optional(hokkienOther),
    },
    {
      id: "hakka",
      questionId: "hakka",
      answer: [hakka],
    },
    {
      id: "hakkaOther",
      questionId: "hakkaOther",
      answer: optional(hakkaOther),
    },
    {
      id: "otherLanguage",
      questionId: "otherLanguage",
      answer: optional(otherLanguage),
    },
    {
      id: "background",
      questionId: "background",
      answer: optional(background),
    },
  ];
}


module.exports = {
  getTicket,
  getTicketAnswer
}
