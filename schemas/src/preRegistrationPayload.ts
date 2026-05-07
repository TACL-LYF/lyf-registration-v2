
export type PreRegistrationInputPayload = {
  campersToPreRegister: string[];
  camperRefsToPreRegister: string[];
  camperCurrentGrades?: (number | null)[];
  campYear: number;
  donationAmount: number;
  email: string;
  successUrl: string;
  cancelUrl: string;
  isTestData?: boolean;
};

export type PreRegistrationResponsePayload = {
  status: "error" | "success";
  code: number;
  sessionId?: string;
};
