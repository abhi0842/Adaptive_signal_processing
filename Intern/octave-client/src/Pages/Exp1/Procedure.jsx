import React from 'react'

const Procedure = () => {
  return (
    <div>
        <ol className='list-decimal space-y-5 '>
              <li>Select the Algorithm which you want to try out.</li>
              <li>After that select the input file and parameters,You can directly give the values or use the slidebar for the input.</li>
              <li>Generate code will generate the code of the respective algorithm on the left side.</li>
              <li>After generating the code you can download the code by clicking download button.</li>
              <li>Run the code using (Submit and Run) button.</li>
              <li>Result will be displayed under the generate code button.</li>
      </ol>
    </div>
  )
}

export default Procedure
