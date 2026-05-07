export interface MoveCampersOffWaitlistRequest {
  parentNames: string[]
  parentEmails: string[]
  campYear: number
  camperName: string
  registrationId: string
  campTrack: string
  isTestData: boolean
}
