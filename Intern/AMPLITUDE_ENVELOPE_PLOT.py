import matplotlib.pyplot as plt
import librosa
import librosa.display
import os
def amplitude_envelope_plot(input_signal,inpaudname,output_signal,sampling_rate,HOP_LENGTH,feature_name,output_path,uniqueIdentifier):

     # Conversion from frames to time using inbulit function
    frames = range(len(output_signal))
    t_audio = librosa.frames_to_time(frames, hop_length=HOP_LENGTH,sr=sampling_rate)
    plt.figure(figsize=(18,12))
    base, ext = os.path.splitext(output_path)
    # Visualising audio signal in the time domain
    plt.subplot(2, 1, 1)
    librosa.display.waveshow(input_signal,sr = sampling_rate, alpha=0.5 ,axis='s',color='m')
    plt.ylim((-1, 1))
    plt.title(f"Input Audio {inpaudname}")
    plt.ylabel('Amplitude')
    plt.savefig(os.path.join(output_path, f'{uniqueIdentifier}_Input.png'))
    #plt.show()
        
    plt.subplot(2, 1,2)
    librosa.display.waveshow(input_signal,sr = sampling_rate,alpha=0.5 ,color='aqua')
    plt.plot(t_audio, output_signal, color="r")
    plt.ylim((-1, 1))
    plt.title(f"Input Audio {inpaudname} Feature Name {feature_name}")
    plt.ylabel('Amplitude')

    #plt.show()
    plt.tight_layout()
    plt.savefig(os.path.join(output_path, f'{uniqueIdentifier}_AmplitudeEnvelope.png'))
    plt.close()