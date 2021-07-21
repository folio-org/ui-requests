// response from 'circulation/check-in-by-barcode' when checkin the loan

// eslint-disable-next-line import/prefer-default-export
export const loan = {
  loan: {
    id: '820e353e-875a-4982-b7db-feae74638092',
    userId: '91e8c004-9d0d-43c1-b3b4-01684719b648',
    itemId: '7212ba6a-8dcf-45a1-be9a-ffaa847c4423',
    itemEffectiveLocationIdAtCheckOut: 'fcd64ce1-6995-48f0-840e-89ffa2288371',
    status: {
      name: 'Closed'
    },
    loanDate: '2021-03-31T09:08:08Z',
    dueDate: '2021-03-31T10:08:08.000+00:00',
    returnDate: '2021-03-31T11:54:14.000Z',
    systemReturnDate: '2021-03-31T11:54:14.269+00:00',
    action: 'checkedin',
    loanPolicyId: '43198de5-f56a-4a53-a0bd-5a324418967a',
    checkoutServicePointId: '7c5abc9f-f3d7-4856-b8d7-6712462ca007',
    checkinServicePointId: '7c5abc9f-f3d7-4856-b8d7-6712462ca007',
    overdueFinePolicyId: 'cd3f6cac-fa17-4079-9fae-2fb28e521412',
    lostItemPolicyId: 'ed892c0e-52e0-4cd9-8133-c0ef07b4a709',
    metadata: {
      createdDate: '2021-03-31T09:08:10.569+00:00',
      createdByUserId: 'd96e3eaa-617a-5485-8b46-c1a05eddd99e',
      updatedDate: '2021-03-31T11:54:14.674+00:00',
      updatedByUserId: 'd96e3eaa-617a-5485-8b46-c1a05eddd99e'
    },
    item: {
      id: '7212ba6a-8dcf-45a1-be9a-ffaa847c4423',
      holdingsRecordId: 'e3ff6133-b9a2-4d4c-a1c9-dc1867d4df19',
      instanceId: '5bf370e0-8cca-4d9c-82e4-5170ab2a0a39',
      title: 'A semantic web primer',
      barcode: '10101',
      contributors: [{
        name: 'Antoniou, Grigoris'
      }, {
        name: 'Van Harmelen, Frank'
      }],
      callNumber: 'TK5105.88815 . A58 2004 FT MEADE',
      copyNumber: 'Copy 2',
      callNumberComponents: {
        callNumber: 'TK5105.88815 . A58 2004 FT MEADE'
      },
      status: {
        name: 'In transit'
      },
      inTransitDestinationServicePointId: '3a40852d-49fd-4df2-a1f9-6e2641a6e91f',
      inTransitDestinationServicePoint: {
        id: '3a40852d-49fd-4df2-a1f9-6e2641a6e91f',
        name: 'Circ Desk 1'
      },
      location: {
        name: 'Main Library'
      },
      materialType: {
        name: 'book'
      }
    },
    borrower: {
      firstName: 'Anna',
      lastName: 'Melnyk',
      middleName: null,
      barcode: '777777'
    },
    loanPolicy: {
      name: null
    },
    overdueFinePolicy: {
      name: null
    },
    lostItemPolicy: {
      name: null
    },
    feesAndFines: {
      amountRemainingToPay: 0.0
    }
  },
  item: {
    id: '7212ba6a-8dcf-45a1-be9a-ffaa847c4423',
    holdingsRecordId: 'e3ff6133-b9a2-4d4c-a1c9-dc1867d4df19',
    instanceId: '5bf370e0-8cca-4d9c-82e4-5170ab2a0a39',
    title: 'A semantic web primer',
    barcode: '10101',
    contributors: [{
      name: 'Antoniou, Grigoris'
    }, {
      name: 'Van Harmelen, Frank'
    }],
    callNumber: 'TK5105.88815 . A58 2004 FT MEADE',
    copyNumber: 'Copy 2',
    callNumberComponents: {
      callNumber: 'TK5105.88815 . A58 2004 FT MEADE'
    },
    status: {
      name: 'In transit'
    },
    inTransitDestinationServicePointId: '3a40852d-49fd-4df2-a1f9-6e2641a6e91f',
    inTransitDestinationServicePoint: {
      id: '3a40852d-49fd-4df2-a1f9-6e2641a6e91f',
      name: 'Circ Desk 1'
    },
    location: {
      name: 'Main Library'
    },
    materialType: {
      name: 'book'
    }
  },
  staffSlipContext: {
    item: {
      title: 'A semantic web primer',
      barcode: '10101',
      status: 'In transit',
      primaryContributor: null,
      allContributors: 'Antoniou, Grigoris; Van Harmelen, Frank',
      enumeration: '',
      volume: null,
      chronology: '',
      yearCaption: '',
      materialType: 'book',
      loanType: 'Can circulate',
      copy: 'Copy 2',
      numberOfPieces: null,
      descriptionOfPieces: null,
      effectiveLocationSpecific: 'Main Library',
      effectiveLocationLibrary: 'Datalogisk Institut',
      effectiveLocationCampus: 'City Campus',
      effectiveLocationInstitution: 'Københavns Universitet',
      callNumber: 'TK5105.88815 . A58 2004 FT MEADE',
      callNumberPrefix: null,
      callNumberSuffix: null,
      lastCheckedInDateTime: '2021-03-31T11:54:14.813Z',
      fromServicePoint: 'Online',
      toServicePoint: 'Circ Desk 1'
    }
  },
  inHouseUse: false
};
