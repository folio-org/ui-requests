import React from 'react';
import PropTypes from 'prop-types';
import Barcode from 'react-barcode';
import HtmlToReact, { Parser } from 'html-to-react';
import DOMPurify from 'dompurify';

const processNodeDefinitions = new HtmlToReact.ProcessNodeDefinitions(React);
const rules = [
  {
    replaceChildren: true,
    shouldProcessNode: node => node.name === 'barcode',
    processNode: (_, children) => (<Barcode value={children[0] ? children[0].trim() : ' '} />),
  },
  {
    shouldProcessNode: () => true,
    processNode: processNodeDefinitions.processDefaultNode,
  }
];

const parser = new Parser();

const ComponentToPrint = ({ dataSource, templateFn }) => {
  const componentStr = DOMPurify.sanitize(templateFn(dataSource), { ADD_TAGS: ['Barcode'] });
  const Component = parser.parseWithInstructions(componentStr, () => true, rules) || null;

  return Component;
};

ComponentToPrint.propTypes = {
  templateFn: PropTypes.func.isRequired,
  dataSource: PropTypes.arrayOf(
    PropTypes.shape({
      request: PropTypes.shape({
        requestID: PropTypes.string,
      }),
    })
  ).isRequired,
};

export default ComponentToPrint;
