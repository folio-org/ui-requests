import { useState, useEffect } from 'react';
import { useOkapiKy } from '@folio/stripes/core';

// This component renders no content: it exists to obtain the
// forUseAtLocation bit using React hooks, and to feed that data back
// to the class-based calling component. It follows the "hook bridge"
// pattern, because refactoring this logic to use class-based
// lifecycle components would be arduous and error prone, and result
// in code that is more difficult to prove right or to maintain.

function LoanPolicyHookBridge({ selectedItem, selectedUser, setForUseAtLocation }) {
  const okapiKy = useOkapiKy();
  const [loanPolicyId, setLoanPolicyId] = useState();

  const itemTypeId = selectedItem?.materialType?.id;
  const loanTypeId = selectedItem?.temporaryLoanType?.id || selectedItem?.permanentLoanType?.id;
  const locationId = selectedItem?.effectiveLocation?.id;
  const patronTypeId = selectedUser?.patronGroup;

  useEffect(() => {
    if (itemTypeId && loanTypeId && locationId && patronTypeId) {
      okapiKy('circulation/rules/loan-policy?' +
              `item_type_id=${itemTypeId}&` +
              `loan_type_id=${loanTypeId}&` +
              `location_id=${locationId}&` +
              `patron_type_id=${patronTypeId}&`).then(res => {
        res.json().then(policy => {
          setLoanPolicyId(policy.loanPolicyId);
        });
      });
    }
    // okapiKy cannot be included in deps, otherwise useEffect fires in a loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemTypeId, loanTypeId, locationId, patronTypeId]);

  useEffect(() => {
    if (loanPolicyId) {
      okapiKy(`loan-policy-storage/loan-policies/${loanPolicyId}`).then(res => {
        res.json().then(policy => {
          // Notify parent component whenever state changes
          setForUseAtLocation(policy?.loansPolicy?.forUseAtLocation);
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loanPolicyId]);

  // No UI, just side effects
  return null;
}

export default LoanPolicyHookBridge;
