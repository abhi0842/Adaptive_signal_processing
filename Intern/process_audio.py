import Amplitude_Envelope_Features_Extract as AMPENV
import AMPLITUDE_ENVELOPE_PLOT as AMPPLOT
import librosa
import sys
import argparse
import os

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Process audio file for amplitude envelope feature extraction.')
    parser.add_argument('--file', type=str, required=True, help='Audio file name (in input/ folder)')
    parser.add_argument('--sr', type=int, required=True, help='Sampling rate')
    parser.add_argument('--frame', type=int, required=True, help='Frame length')
    parser.add_argument('--hop', type=int, required=True, help='Hop length')
    parser.add_argument('--feature', type=str, required=True, choices=['MAX', 'MIN', 'MEAN', 'MEDIAN'], help='Feature')
    parser.add_argument('--unique-id', type=str, required=True, help='Unique identifier for output file')

    args = parser.parse_args()

    # Paths
    input_file = os.path.join('inputs' \
    '', args.file)
    output_dir = 'outputs'
    os.makedirs(output_dir, exist_ok=True)
    output_file = os.path.join(output_dir, f'amplitude_envelope_{args.unique_id}.png')

    print(f"\nAudio file selected is :: {args.file}")

    # Load audio file
    input_audio, sr = librosa.load(input_file, sr=args.sr)
    sample_duration = 1 / sr
    tot_samples = len(input_audio)

    print(f"\nSampling Rate used for the audio file {args.file} :: {sr}")
    print(f"\nFrame Length selected for the audio file {args.file} :: {args.frame}")
    print(f"\nHop Length used for the audio file {args.file} :: {args.hop}")
    print(f"\nOne sample lasts for {sample_duration:6f} seconds")
    print(f"\nTotal number of samples in the audio file is::{tot_samples}")
    print(f"\nFeature Selected in the audio file is::{args.feature}")

    # Compute amplitude envelope feature
    amp_env_feat1 = AMPENV.amplitude_envelope(input_audio, args.frame, args.hop, args.feature)

    # Plot and save to the required output file
    AMPPLOT.amplitude_envelope_plot(
    input_signal=input_audio,
    inpaudname=args.file,
    output_signal=amp_env_feat1,
    sampling_rate=args.sr,
    HOP_LENGTH=args.hop,
    feature_name=args.feature,
    output_path='outputs',
    uniqueIdentifier=args.unique_id
    )