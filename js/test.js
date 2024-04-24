
import RecordPlugin from './record.esm.js';

let wavesurfer, record, recordedBlob;
let scrollingWaveform = false;

const createWaveSurfer = () => {
    // Create an instance of WaveSurfer
    if (wavesurfer) {
        wavesurfer.destroy();
    }

    wavesurfer = WaveSurfer.create({
        container: '#mic_final',
        waveColor: '#F8991D',
        progressColor: '#F8991D',
        barWidth: 4,
    });

    // Initialize the Record plugin
    record = wavesurfer.registerPlugin(
        RecordPlugin.create({ scrollingWaveform, renderRecordedAudio: false }),
    );

    // Render recorded audio
    record.on('record-end', (blob) => {
        recordedBlob = blob;
        const container = document.querySelector('#recordings_final');
        const recordedUrl = URL.createObjectURL(blob);
        createRecordedWaveSurfer(recordedUrl);
    });

    record.on('record-progress', (time) => {
        updateProgress(time);
    });
};

const createRecordedWaveSurfer = (recordedUrl) => {
    const container = document.querySelector('#waveAudio');
    if (wavesurfer) {
        wavesurfer.destroy();
    }

    // Create a new WaveSurfer instance for recorded audio playback
    wavesurfer = WaveSurfer.create({
        container,
        waveColor: '#9b9b9b',
        progressColor: '#F8991D',
        barWidth: 4,
        url: recordedUrl,
        splitChannels: false,
        normalize: false,
        cursorWidth: 2,
        barAlign: '',
        minPxPerSec: 1,
        fillParent: true,
        mediaControls: true,
        autoplay: false,
        interact: true,
        dragToSeek: false,
        hideScrollbar: false,
        audioRate: 1,
        autoScroll: true,
        autoCenter: true,
        sampleRate: 8000,
        height: 10,
    });
};

const progress = document.querySelector('#progress_final');
const updateProgress = (time) => {
    const formattedTime = [
        Math.floor((time % 3600000) / 60000), // minutes
        Math.floor((time % 60000) / 1000), // seconds
    ]
        .map((v) => (v < 10 ? '0' + v : v))
        .join(':');
    progress.textContent = formattedTime;
};

const pauseButton = document.querySelector('#pause');
pauseButton.onclick = () => {
    if (record.isPaused()) {
        record.resumeRecording();
        pauseButton.textContent = 'Pause';
        return;
    }

    record.pauseRecording();
    pauseButton.textContent = 'Resume';
};

const micSelect = document.querySelector('#mic-select');
{
    // Mic selection
    RecordPlugin.getAvailableAudioDevices().then((devices) => {
        devices.forEach((device) => {
            const option = document.createElement('option');
            option.value = device.deviceId;
            option.text = device.label || device.deviceId;
            micSelect.appendChild(option);
        });
    });
}

const recButtonDone = document.querySelector('#record_final_done');
const recButton = document.querySelector('#record_final');
const listenModal = document.getElementById('recordAudioFinal');

// Record button
recButton.onclick = () => {
    recButton.disabled = true;
    // reset the wavesurfer instance
    const image2 = document.createElement('img');
    const textNode = document.createTextNode('Done');
    const deviceId = micSelect.value;
    record.startRecording({ deviceId }).then(() => {
        image2.src = './images/check-sign.svg';
        recButton.innerHTML = '';
        recButton.style.display = 'none';
        recButtonDone.style.display = 'block';
        recButton.disabled = false;
        document.getElementById('mic').style.display = 'block';
        document.getElementById('record_final_done').style.display = 'block';
        document.getElementById('record_final').style.display = 'none';
        document.getElementById('recordings_final').style.display = 'none';
        pauseButton.style.display = 'none';

        // Disable the done button for the first 30 seconds
        // recButtonDone.disabled = true;
        // setTimeout(() => {
        //   recButtonDone.disabled = false;
        //   recButtonDone.classList.remove('doneDisabled');
        // }, 10000);
    });
};

// recButtonDone.onclick = () => {
//   if (record.isRecording() || record.isPaused()) {
//     record.on('record-end', (blob) => {
//       console.log("blob", blob)
//       var i=$(recButtonDone).data("value");
//       var form = $("#aiForm"+i)[0];
//       var formData = new FormData(form);

//       formData.append('AudioFile', blob, 'recording.wav');


//       for (var key of formData.entries()) {
//         console.log(key[0] + ', ' + key[1]);
//       }
//       // console.log($("#aiForm"+i));
//       // var form = $("#aiForm"+i)[0];
//       // var formData = new FormData(form);
//       let todayDate = new Date().toUTCString().slice(5, 16);
//       // Make a POST request to the API endpoint to upload the recorded audio
//       fetch('https://api.bdjobs.com/mybdjobs/v1/AIAssessment/audio_File_upload', {
//         method: 'POST',
//         body: formData
//       })
//         .then(response => response.json())
//         .then(data => {
//           console.log(data.statusCode);
//           console.log(data);
//           $("#animation_image").hide();
//           if (data.statusCode == "0") {
//             str = "Your recording has been uploaded successfully";
//             showSuccessAlertMessage(str);
//             console.log(str);


//             document.getElementById("beforeUpload").style.display = "none";
//             document.getElementById("aiForm0").style.display = "none";

//             document.getElementById("uploaded_file").style.display = "block";
//             document.getElementById('file_name').innerHTML = document.getElementById("ai_file_content").innerHTML;
//             document.getElementById('file_up_date').innerHTML = "Uploaded on: " + todayDate;
//             $(listenModal).modal('hide');
//           } else {
//             //customValidationAlertWithReload("Warning", data.massege, "Ok");


//           }
//         })
//         .catch(function (error) {
//           console.log('Error:', error);
//         });
//     });

//     // Stop recording and hide buttons/modal
//     record.stopRecording();
//     recButton.style.display = 'none';
//     recButtonDone.style.display = 'block';
//     pauseButton.style.display = 'none';
//     $(listenModal).modal('hide');
//     document.getElementById('progress_text').style.display = 'none';

//     return;
//   }
// }



recButtonDone.onclick = () => {
    if (record.isRecording() || record.isPaused()) {
        record.on('record-end', (blob) => {
            console.log("blob", blob);
            var i = $(recButtonDone).data("value");
            var form = $("#aiForm" + i)[0];
            var formData = new FormData(form);

            formData.append('AudioFile', blob, 'recording.wav');

            var durationMillis = record.getDuration();
            var durationSeconds = durationMillis / 1000;

            console.log("Audio Duration:", durationSeconds, "seconds");

            var url = window.URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'recording.wav';

            a.setAttribute('duration', durationSeconds);

            // Trigger the click event on the link to initiate the download
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            let todayDate = new Date().toUTCString().slice(5, 16);
            fetch('https://api.bdjobs.com/mybdjobs/v1/AIAssessment/audio_File_upload', {
                method: 'POST',
                body: formData
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data.statusCode);
                    console.log(data);
                    $("#animation_image").hide();
                    if (data.statusCode == "0") {
                        str = "Your recording has been uploaded successfully";
                        showSuccessAlertMessage(str);
                        console.log(str);

                        document.getElementById("beforeUpload").style.display = "none";
                        document.getElementById("aiForm0").style.display = "none";

                        document.getElementById("uploaded_file").style.display = "block";
                        document.getElementById('file_name').innerHTML = document.getElementById("ai_file_content").innerHTML;
                        document.getElementById('file_up_date').innerHTML = "Uploaded on: " + todayDate;
                        $(listenModal).modal('hide');
                    } else {
                        //customValidationAlertWithReload("Warning", data.massege, "Ok");
                    }
                })
                .catch(function (error) {
                    console.log('Error:', error);
                });
        });

        // Stop recording and hide buttons/modal
        record.stopRecording();
        recButton.style.display = 'none';
        recButtonDone.style.display = 'block';
        pauseButton.style.display = 'none';
        $(listenModal).modal('hide');
        document.getElementById('progress_text').style.display = 'none';

        return;
    }
}



document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('mic-select').style.display = 'none';
    document.getElementById('recordings_final').style.display = 'none';
    createWaveSurfer();
});

// Event listener for listening to recorded audio in the "Listen" modal
document.getElementById('listenAudio').addEventListener('show.bs.modal', function (event) {
    const recordedUrl = URL.createObjectURL(recordedBlob);
    createRecordedWaveSurfer(recordedUrl);
    wavesurfer.play();
});

// function submitAudio(i){

//   if (record.isRecording() || record.isPaused()) {
//     record.stopRecording()
//     recButton.style.display = 'none'
//     recButtonDone.style.display = 'block'
//     pauseButton.style.display = 'none'
//     $(listenModal).modal('hide')
//     document.getElementById('progress_text').style.display = 'none'
//     // Additional code for debugging purposes
//     console.log("Before reload");


//   //  const recordedUrl = URL.createObjectURL(recordedBlob)
//     const audio = new Audio();
//     audio.src =URL.createObjectURL(recordedBlob)
//     document.getElementById('AudioFile').value = audio.src;

//   console.log($("#aiForm"+i));
//   var form = $("#aiForm"+i)[0];
//   var formData = new FormData(form);
//   let todayDate = new Date().toUTCString().slice(5, 16);
//   $("#animation_image").show();
//   document.getElementById("filecontainer").style.display = "none";
//   document.getElementById("btn_container").style.display = "none";


//       fetch('https://api.bdjobs.com/mybdjobs/v1/AIAssessment/audio_File_upload', {
//           method: 'POST',
//           body: formData
//       }).then(response => response.json())
//           .then(data => {
//               console.log(data.statusCode);
//                $("#animation_image").hide();
//               if(data.statusCode=="0")
//               {
//                    str = "Your recording has been uploaded successfully";
//                    showSuccessAlertMessage(str);

//                   document.getElementById("beforeUpload").style.display="none";
//                   document.getElementById("aiForm0").style.display="none";

//                   document.getElementById("uploaded_file").style.display="block";
//                   document.getElementById('file_name').innerHTML = document.getElementById("ai_file_content").innerHTML;
//                   document.getElementById('file_up_date').innerHTML = "Uploaded on: "+todayDate;
//                   $(listenModal).modal('hide')



//                   window.location.reload();

//                   // Additional code for debugging purposes
//                   console.log("After reload");

//               }
//               else{
//                   customValidationAlertWithReload("Warning",data.massege, "Ok");
//                   document.getElementById('AudioFile').value = '';
//                   //document.getElementById('ErrorMassage').textContent= data.massege;


//               }

//       })
//       .catch(function(error) {
//           console.log('Error:', error);

//       });
//     }




// }




