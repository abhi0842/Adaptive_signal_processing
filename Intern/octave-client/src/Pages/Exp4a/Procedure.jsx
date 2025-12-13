import React from 'react'

const Procedure = () => {
  return (
    <div>
      <ol className='list-decimal space-y-5 '>
        <li>Place a list of different audio files approximately 10 in number in a folder namely “Input Audio”.</li>
        <li>Select a particular audio file from the folder and carry out the process of analog to digital conversion through sampling and quantization.</li>
        <li>After obtaining the digitized version of the audio file the next process involves framing that denotes bundling together of different samples of the audio file in multiple frames. The number of frames selected that also denotes the frame size must be power of 2 in an audio file. 
          Typical values are generally in the range of 256 to 8192.</li>
        <li>Select the sampling rate, frame length and hop length from a particular audio file and obtain multiple sets of reading by changing the above parameters associated with the audio file.</li>
        <li>Compute the maximum amplitude values of all samples in a given frame and repeat the same process for all the different frames in an audio file.</li>
        <li>After the computation process carried out in <b>Step 4</b>, aggregate the results to obtain the single feature vector of the whole audio. The aggregation features can be Mean, Median, Max and Min. This single feature vector obtained basically denotes the amplitude envelope of whole duration of the audio.</li>
        <li>Lastly the obtained feature vector denoting the amplitude envelope needs to be plotted for all the different aggregation features discussed in <b>Step 6</b>.</li>
        <li><b>The above steps from Step 1 to Step 7 needs to be repeated for all the 10 audio files.</b></li>
      </ol>
    </div>
  )
}

export default Procedure
