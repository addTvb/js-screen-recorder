let stream = null;
let audio = null;
let mixedStream = null;
let chunks = [];
let recorder = null;
let startButton = null;
let stopButton = null;
let downloadButton = null;
let savedVideo = null;

async function setupStream() {
	try {
		stream = await navigator.mediaDevices.getDisplayMedia({
			video: true,
		});

		audio = await navigator.mediaDevices.getUserMedia({
			audio: {
				echoCancellation: true,
				noiseSuppression: true,
				sampleRate: 44100,
			},
		});

		setupVideoFeedback();
	} catch (err) {
		console.error(err);
	}
}

function setupVideoFeedback() {
	if (stream) {
		const video = document.querySelector('#currentVideo');
		video.srcObject = stream;
		video.play();
	} else {
		console.warn('No stream available');
	}
}

async function startRecording() {
	await setupStream();

	if (stream && audio) {
		mixedStream = new MediaStream([...stream.getTracks(), ...audio.getTracks()]);
		recorder = new MediaRecorder(mixedStream);
		recorder.ondataavailable = handleDataAvailable;
		recorder.onstop = handleStop;
		recorder.start(1000);

		startButton.disabled = true;
		stopButton.disabled = false;

		console.log('Recording started');
	} else {
		console.warn('No stream available.');
	}
}

function stopRecording() {
	recorder.stop();

	startButton.disabled = false;
	stopButton.disabled = true;
}

function handleDataAvailable(e) {
	chunks.push(e.data);
}

function handleStop(e) {
	const blob = new Blob(chunks, { type: 'video/mp4' });
	chunks = [];

	downloadButton.href = URL.createObjectURL(blob);
	downloadButton.download = 'video.mp4';
	downloadButton.disabled = false;

	savedVideo.src = URL.createObjectURL(blob);
	savedVideo.load();
	savedVideo.onloadeddata = function () {
		const rc = document.querySelector('#savedVideoWrapper');
		rc.classList.remove('hidden');
		rc.scrollIntoView({ behavior: 'smooth', block: 'start' });

		savedVideo.play();
	};

	stream.getTracks().forEach((track) => track.stop());
	audio.getTracks().forEach((track) => track.stop());

	console.log('Recording stopped');
}

window.addEventListener('load', () => {
	startButton = document.querySelector('#startButton');
	stopButton = document.querySelector('#stopButton');
	downloadButton = document.querySelector('#downloadVideo');
	savedVideo = document.querySelector('#savedVideo');

	startButton.addEventListener('click', startRecording);
	stopButton.addEventListener('click', stopRecording);
});
