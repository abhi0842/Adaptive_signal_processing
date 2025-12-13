import numpy as np
# Some values as example FRAME_SIZE = 1024
# Some values as exampleHOP_LENGTH = 512

#Calculate the amplitude envelope of a signal with a given frame length and hop length.

#Default feature selected is 'MAX' is no feature value is passed to the function
def amplitude_envelope(signal, frame_length, hop_length, feature ='MAX'):
    # amp_env_feat is a list to store amplitude envelope values of different features
    amp_env_feat = []
    
    # calculate amplitude envelope for each frame based on aggregation feature
    if feature.upper() == 'MAX':
        for i in range(0, len(signal), hop_length): 
             amp_env_feat.append(max(signal[i:i+frame_length])) 
                   
    elif feature.upper() == 'MIN':
        for i in range(0, len(signal), hop_length): 
            amp_env_feat.append(min(signal[i:i+frame_length])) 

    elif feature.upper() == 'MEAN':
        for i in range(0, len(signal), hop_length): 
            amp_env_feat.append(np.mean(signal[i:i+frame_length])) 

    elif feature.upper() == 'MEDIAN':
        for i in range(0, len(signal), hop_length): 
            amp_env_feat.append(np.median(signal[i:i+frame_length])) 
    else:
        for i in range(0, len(signal), hop_length):
            amp_env_feat.append(0)
    
    amp_env_feat = np.array(amp_env_feat)
    return amp_env_feat