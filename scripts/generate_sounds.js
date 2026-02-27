const fs = require('fs');

function writeWav(filename, samples, sampleRate = 44100) {
    const numChannels = 1;
    const bytesPerSample = 2;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = samples.length * bytesPerSample;
    const buffer = Buffer.alloc(44 + dataSize);

    // RIFF chunk descriptor
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + dataSize, 4);
    buffer.write('WAVE', 8);

    // fmt sub-chunk
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16); // Subchunk1Size
    buffer.writeUInt16LE(1, 20); // AudioFormat (PCM)
    buffer.writeUInt16LE(numChannels, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(byteRate, 28);
    buffer.writeUInt16LE(blockAlign, 32);
    buffer.writeUInt16LE(bytesPerSample * 8, 34);

    // data sub-chunk
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);

    for (let i = 0; i < samples.length; i++) {
        let s = Math.max(-1, Math.min(1, samples[i]));
        buffer.writeInt16LE(s < 0 ? s * 0x8000 : s * 0x7FFF, 44 + i * 2);
    }

    fs.mkdirSync('public/sounds', { recursive: true });
    fs.writeFileSync('public/sounds/' + filename, buffer);
}

const sampleRate = 44100;

function createClick() {
    // Soft digital tap (<120ms) - low frequency mixed with a short transient
    const len = Math.floor(sampleRate * 0.08); // 80ms
    const samples = new Float32Array(len);
    for (let i = 0; i < len; i++) {
        const t = i / sampleRate;
        const env = Math.exp(-t * 80); // Fast decay
        samples[i] = Math.sin(t * Math.PI * 2 * 300) * env * 0.3 + (Math.random() - 0.5) * env * 0.1;
    }
    writeWav('click.wav', samples);
}

function createSuccess() {
    // Subtle upward confirmation tone - two soft sine wave beeps, rising
    const len = Math.floor(sampleRate * 0.3); // 300ms
    const samples = new Float32Array(len);
    for (let i = 0; i < len; i++) {
        const t = i / sampleRate;
        let env, freq;
        if (t < 0.15) {
            env = t < 0.02 ? t / 0.02 : Math.exp(-(t - 0.02) * 20);
            freq = 600;
        } else {
            const t2 = t - 0.15;
            env = t2 < 0.02 ? t2 / 0.02 : Math.exp(-(t2 - 0.02) * 15);
            freq = 900;
        }
        samples[i] = Math.sin(t * Math.PI * 2 * freq) * env * 0.4;
    }
    writeWav('success.wav', samples);
}

function createReject() {
    // Soft muted warning tone
    const len = Math.floor(sampleRate * 0.4);
    const samples = new Float32Array(len);
    for (let i = 0; i < len; i++) {
        const t = i / sampleRate;
        const env = t < 0.05 ? t / 0.05 : Math.exp(-(t - 0.05) * 8);
        const mod = Math.sin(t * Math.PI * 2 * 20);
        samples[i] = Math.sin(t * Math.PI * 2 * 250) * env * 0.4 * (0.8 + 0.2 * mod);
    }
    writeWav('reject.wav', samples);
}

function createPop() {
    // Light pop
    const len = Math.floor(sampleRate * 0.05);
    const samples = new Float32Array(len);
    for (let i = 0; i < len; i++) {
        const t = i / sampleRate;
        const env = t < 0.01 ? t / 0.01 : Math.exp(-(t - 0.01) * 60);
        // Pitch drop
        const freq = 800 * Math.exp(-t * 100);
        samples[i] = Math.sin(t * Math.PI * 2 * freq) * env * 0.3;
    }
    writeWav('pop.wav', samples);
}

function createPing() {
    // Clean ping
    const len = Math.floor(sampleRate * 0.4);
    const samples = new Float32Array(len);
    for (let i = 0; i < len; i++) {
        const t = i / sampleRate;
        const env = Math.exp(-t * 10);
        samples[i] = Math.sin(t * Math.PI * 2 * 1200) * env * 0.2 + Math.sin(t * Math.PI * 2 * 2400) * Math.exp(-t * 20) * 0.05;
    }
    writeWav('ping.wav', samples);
}

createClick();
createSuccess();
createReject();
createPop();
createPing();
console.log("Sounds generated successfully in public/sounds");
