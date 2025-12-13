import React from 'react'
import figure1 from './figure1.png'
import figure2 from './figure2.png'
import flowchart from './flowchart.png'

const Theory = () => {
  return (
    <div className='leading-loose text-sm'>
      <p className='font-bold text-xl text-green underline'>Amplitude Envelope</p>
      <p>
      Amplitude envelope refers to the changes in the amplitude of a sound over time, and is an influential property as it affects our perception of timbre. 
      This is an important property of sound, because it is what allows us to effortlessly identify sounds, and uniquely distinguish them from other sounds. 
      The amplitude envelope of a particular audio file is computed by the concept of framing. 
      Once the number of frames is determined for an audio signal a particular amplitude value is computed for the entire frame based on the aggregation feature used. 
      This process of computation is further repeated for all the frames in an audio file.<br /><br />
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      <img src={figure1} alt="figure1" style={{ maxWidth: "100%" }} />
      </div>
      The amplitude envelope is a time-domain audio feature extracted from the raw audio waveform that refers to fluctuations in the amplitude of a sound over time and is an essential attribute since it influences our auditory perception of timbre. 
      This is an important sound attribute because it allows us to swiftly detect and distinguish sounds. 
      The maximum amplitude values among all samples in each frame make up the signal’s Amplitude Envelope which provides a rough estimation of loudness.
      This feature has been extensively used for onset detection and music genre classification. It is, however, more sensitive to outliers than the RMS energy audio feature, hence it is often less preferable to the RMS audio feature.
      <br /><br />
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <img src={flowchart} alt="flowchart" style={{ maxWidth: "80%" }} />
      </div>
      There are two kinds of amplitude envelopes: percussive and flat. Percussive envelopes are characterized by an abrupt onset followed by an immediate exponential decay. 
      This amplitude envelope is characteristic of various impact sounds: two wine glasses clinking together, hitting a drum, slamming a door, etc. Flat envelopes, on the other hand, are characterized by an abrupt onset, an indefinite sustain period and an abrupt offset
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
      <img src={figure2} alt="figure2" style={{ maxWidth: "65%" }} />
      </div>
      </p><br />
    </div>
  )
}

export default Theory

