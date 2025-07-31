import React, { useState, useEffect } from 'react';
import { useOkapiKy } from '@folio/stripes/core';
import ItemDetail from '../../../ItemDetail';

// Although the request already contains a stub item object, we need
// to fetch the real item because the stub lacks the `loanType` field,
// before passing the result through to the regular <ItemDetail>
// component.

function FullItemDetail(props) {
  const okapiKy = useOkapiKy();
  const [fullItem, setFullItem] = useState();

  useEffect(() => {
    async function fetchItem() {
      const res = await okapiKy(`inventory/items?query=barcode=="${props.item.barcode}"`);
      const data = await res.json();
      setFullItem(data.items[0]);
    }
    fetchItem();
    // A useOkapiKy bug means it returns a new function each time, causing infinite useEffect invocation if included in deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.item.barcode]);

  return <ItemDetail {...props} item={fullItem || props.item} />;
}

export default FullItemDetail;
