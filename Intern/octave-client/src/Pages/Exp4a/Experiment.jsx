import React from 'react'
import Quiz from './Pretest';
import Postquiz from './Posttest';
import Theory from './Theory';
import Procedure from './Procedure';
import Feedback from '../Exp1/Feedback';
import Simulation from './Simulation';
import Contact from '../Exp1/Contact';

const Experiment = ({activeTab}) => {

  const renderContent = () => {
    switch (activeTab) {
      case '':
        return <div>To obtain the amplitude envelope based on different aggregation features in different frames of an audio file</div>;
      case 'theory':
        return <Theory/>;
      case 'pretest':
        return <Quiz/>;
      case 'procedure':
        return <Procedure/>;
      case 'simulation':
        return <Simulation />;
      case 'post-test':
        return <Postquiz/>;
      case 'references':
        return <div >
          <ul style={{ display: "block", listStyleType: "decimal", paddingLeft: "20px" }}>
            <li>Zölzer, Udo. <i>Digital audio signal processing.</i> John Wiley & Sons, 2022.</li>
            <li>Kahrs, Mark, and Karlheinz Brandenburg, eds. <i>Applications of digital signal processing to audio and acoustics.</i> Springer Science & Business Media, 1998.</li>
            <li>Gold, Ben, Nelson Morgan, and Dan Ellis. <i>Speech and audio signal processing: processing and perception of speech and music.</i> John Wiley & Sons, 2011.</li>
            <li>Steiglitz, Ken. <i>A digital signal processing primer, with applications to digital audio and computer music.</i> Addison Wesley Longman Publishing Co., Inc., 1997.</li>
            <li>Li, Francis F., and Trevor J. Cox. <i>Digital signal processing in audio and acoustical engineering.</i> CRC Press, 2019.</li>
            <li>Tan, Li, and Jean Jiang. <i>Digital signal processing: fundamentals and applications.</i> Academic press, 2018.</li>
            <li>Ludeman, Lonnie C. <i>Fundamentals of digital signal processing.</i> New York: Harper & Row, 1986.</li>
            <li>Stranneby, Dag. <i>Digital signal processing and applications.</i> Elsevier, 2004.</li>
            <li>Spanias, Andreas, Ted Painter, and Venkatraman Atti. <i>Audio signal processing and coding.</i> John Wiley & Sons, 2007.</li>
            <li>Christensen, Mads G. <i>Introduction to audio processing.</i> Springer, 2019.</li>
          </ul>
        </div>;
      case 'contact':
        return <Contact/>
      case 'feedback':
        return <Feedback/>;
      default:
        return <div></div>;
    }
  };

  return (
          <div className="flex flex-col flex-1 gap-7 font-serif py-2 ">
            <div>
              <p className="font-bold text-lg text-center text-blue underline hover:text-green">
                <a href="https://www.vlab.co.in/broad-area-biotechnology-and-biomedical-engineering">
                  Adaptive Signal Processing
                </a>
              </p>
            </div>
            <div className='pl-16 pr-6'>{renderContent()}</div>
          </div>
  )
}

export default Experiment;
