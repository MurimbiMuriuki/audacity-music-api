
const CANDIDATE_STATUS = {
  ACTIVE: 1,
  INACTIVE: 0,
  OTP_NOT_VERIFIED: 2
};

const ROLE_STATUS = {
  ACTIVE: 1,
  INACTIVE: 0,
};

const Expense_Category_STATUS = {
  ACTIVE: 1,
  INACTIVE: 0,
};

const Expense_STATUS = {
  ACTIVE: 1,
  INACTIVE: 0,
};

const SKILL_STATUS = {
  ACTIVE: 1,
  INACTIVE: 0,
};


const ASSET_STATUS = {
  IN_STOCK: 0,
  IN_USE: 1,
  UNDER_REPAIR: 2,
  LOST: 3,
  STOLEN: 4,
  RETIRED: 5,
  DISPOSED: 6,
};

const ASSET_CONDITION = {
  NEW: 0,
  GOOD: 1,
  FAIR: 2,
  POOR: 3,
};





const CANDIDATE_META_KEYS = {
  gender: "_gender",
  currentLocation: "_currentLocation",
  designationApplyingFor: "_designationApplyingFor",
  currentCompanyName: "_currentCompanyName",
  reasonForChange: "_reasonForChange",
  preferredShift: "_preferredShift",
  resume: "_resume",
  reference1Name: "_reference1Name",
  reference1ContactNumber: "_reference1ContactNumber",
  reference1Designation: "_reference1Designation",
  reference1Experience: "_reference1Experience",
  reference2Name: "_reference2Name",
  reference2ContactNumber: "_reference2ContactNumber",
  reference2Designation: "_reference2Designation",
  reference2Experience: "_reference2Experience",
  source: "_source",
  skill: "_skill",
  currentAddress: "_currentAddress",
  permanentAddress: "_permanentAddress",
  lastIncrementDate: "_lastIncrementDate",
  lastIncrementAmount: "_lastIncrementAmount",
  urlToken: "_urlToken",
  ip: "_ip",
  device: "_device"

};

const EMPLOYEE_META_KEYS = {
  adharCard: "_adharCard",
  panCard: "_panCard",
  bankName: "_bankName",
  bankAccountNumber: "_bankAccountNumber",
  bankIfscCode: "_bankIfscCode",
  bloodGroup: "_bloodGroup",
  emergencyContactName: "_emergencyContactName",
  emergencyContactNumber: "_emergencyContactNumber",
  emergencyContactRelationship: "_emergencyContactRelationship",
  emergencyContactRelationshipOther: "_emergencyContactRelationshipOther",
  gender: "_gender",
  currentShift: "_currentShift",
  lastIncrementDate: "_lastIncrementDate",
  lastIncrementAmount: "_lastIncrementAmount",
  currentSalary: "_currentSalary",
  otherDocumentLink: "_otherDocumentLink",
  urlToken: "_urlToken",
  exitDate: "_exitDate"
};

const USER_META_KEYS = {
  gender: "_gender",
  age: "_age"
};

const trackActivity = {
  candidates: [
    'name',
    'email',
    'phone',
    'noticePeriod',
    'totalExperience',
    'currentSalary',
    'expectedSalary',
    '_currentCompanyName',
    '_designationApplyingFor',
    '_preferredShift',
    '_reasonForChange',
    '_resume',
    '_currentLocation'
  ],
  candidateSales: [
    'name',
    'email',
    'phone',
    'noticePeriod',
    'currentSalary',
    'expectedSalary',
    'preferredShift',
    'reasonForLeaving',
    'resume',
    'gender',
    'joiningDate',
    'totalExperience',
    'monthlySalesTarget',
    'freshBusinessTarget',
    'achievedTarget',
    'businessMethods',
    'leadPlatforms',
    'preferredRegions',
    'preferredShift',
    'topSalesAchievement'
  ],
  employees: [
    'name',
    'personalEmail',
    'phone',
    'uan',
    'alternatePhone',
    'dobDocument',
    'dobCelebration',
    'companyEmail',
    'designation',
    'referenceNumber',
    'employeeCode',
    '_adharCard',
    '_panCard',
    '_bankName',
    '_bankAccountNumber',
    '_bankIfscCode',
    '_emergencyContactName',
    '_emergencyContactNumber',
    '_emergencyContactRelationship',
    '_emergencyContactRelationshipOther',
    '_gender',
    '_currentShift',
    '_lastIncrementDate',
    '_lastIncrementAmount',
    'status',
    '_exitDate'

  ],
  events: [
    'title',
    'fromDate',
    'toDate',
    'isHoliday',
    'isExpired',
    'description'

  ]
};

const EVENT_META_KEYS = {
  birthday: {
    isBannerCreated: '_bannerCreated',
    bannerUrl: '_bannerUrl',
    isSocialMediaPost: '_socialMediaPost',
    isGiftVoucherCreated: '_giftVoucher',
  },
  anniversary: {
    isBannerCreated: '_bannerCreated',
    bannerUrl: '_bannerUrl',
    isSocialMediaPost: '_socialMediaPost',
    isGiftVoucherCreated: '_giftVoucher',
  },
  increment: {
    incrementFormSent: '_incrementFormSent',
    employeeSubmittedIncrementForm: '_employeeSubmittedIncrementForm',
    reviewedByHod: '_reviewedByHod',
    hodReviewRemark: '_hodReviewRemark',
    oneToOneMeeting: '_oneToOneMeeting',
    oneToOneMeetingRemark: '_oneToOneMeetingRemark',
    hrMeeting: '_hrMeeting',
    finalDiscussion: '_finalDiscussion',
    finalDiscussionRemark: '_finalDiscussionRemark',
    incrementAmount: '_incrementAmount',
    newSalary: '_newSalary',
  }
};

const REPORTING_MANAGERS = [
  { name: "Parveen Chauhan", email: "parveen@acewebx.com" },
  { name: "Pawan Rana", email: "pawan@acewebx.com" },
  { name: "Amit Kumar", email: "amit@acewebx.com" },
  { name: "Pankaj Chauhan", email: "pankaj@acewebx.com" },
  { name: "Ace Management", email: "management@acewebx.com" },
  { name: "Ace HR", email: "hr@acewebx.com" }
];

module.exports = {
  CANDIDATE_STATUS,
  ROLE_STATUS,
  CANDIDATE_META_KEYS,
  USER_META_KEYS,
  trackActivity,
  SKILL_STATUS,
  EMPLOYEE_META_KEYS,
  EVENT_META_KEYS,
  REPORTING_MANAGERS,
  Expense_Category_STATUS,
  Expense_STATUS,
  ASSET_STATUS,
  ASSET_CONDITION
};