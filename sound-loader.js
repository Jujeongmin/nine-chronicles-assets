/**
 * SoundLib - sound library loader for the sound pack.
 *
 * Short effects are decoded into AudioBuffers. Music streams through a reused
 * <audio> element, because decoding a long track keeps all of its PCM in memory.
 *
 *   const sounds = await SoundLib.load('assets/library/sounds.json');
 *   addEventListener('pointerdown', () => sounds.unlock(['bgm_main']), { once: true });
 *   await sounds.preload(['sfx_click']);
 *   sounds.play('sfx_click', { volume: 0.8 });
 *   sounds.play('bgm_main', { volume: 0.5, fade: 0.5 });
 *   sounds.stopMusic({ fade: 0.5 });
 */
(function (global) {
  'use strict';

  function joinPath(base, file) {
    if (!base) return file;
    return base.replace(/\/+$/, '') + '/' + file.replace(/^\/+/, '');
  }

  function directoryOf(url) {
    var path = String(url).split(/[?#]/)[0];
    var index = path.lastIndexOf('/');
    return index === -1 ? '' : path.slice(0, index + 1);
  }

  function SoundLib(manifest, baseUrl) {
    this.baseUrl = baseUrl || '';
    this.categories = manifest.categories || {};
    this.games = manifest.games || {};
    this.assets = {};
    (manifest.assets || []).forEach(function (asset) { this.assets[asset.id] = asset; }, this);
    this.context = null;
    this.master = null;
    this._buffers = {};
    this._tracks = {};
    this._currentMusic = null;
  }

  SoundLib.load = function (url, options) {
    options = options || {};
    return fetch(url, { cache: 'no-cache' }).then(function (response) {
      if (!response.ok) throw new Error('failed to load ' + url + ' (' + response.status + ')');
      return response.json();
    }).then(function (manifest) {
      return new SoundLib(manifest, options.baseUrl != null ? options.baseUrl : directoryOf(url));
    });
  };

  SoundLib.prototype.ids = function () { return Object.keys(this.assets); };

  SoundLib.prototype.get = function (id) {
    var asset = this.assets[id];
    if (!asset) throw new Error('unknown sound: ' + id);
    return asset;
  };

  SoundLib.prototype.urlOf = function (id) {
    var asset = this.get(id);
    return joinPath(this.baseUrl, asset.file) + (asset.hash ? '?v=' + asset.hash : '');
  };

  SoundLib.prototype._audio = function () {
    if (!this.context) {
      var Context = global.AudioContext || global.webkitAudioContext;
      this.context = new Context();
      this.master = this.context.createGain();
      this.master.connect(this.context.destination);
    }
    return this.context;
  };

  SoundLib.prototype._track = function (id) {
    var track = this._tracks[id];
    if (track) return track;
    var context = this._audio();
    var element = new Audio();
    element.crossOrigin = 'anonymous';   // Must be set before src, or the node outputs silence.
    element.preload = 'auto';
    element.src = this.urlOf(id);
    var gain = context.createGain();
    context.createMediaElementSource(element).connect(gain);
    gain.connect(this.master);
    track = this._tracks[id] = { element: element, gain: gain, stopTimer: null };
    return track;
  };

  /**
   * Call from the first user gesture. Pass the music ids you will start later
   * without a gesture: mobile browsers only allow those if they were opened here.
   */
  SoundLib.prototype.unlock = function (musicIds) {
    var context = this._audio();
    var resumed = context.state === 'suspended' ? context.resume() : Promise.resolve();
    var primed = (musicIds || []).map(function (id) {
      var track = this._track(id);
      if (this._currentMusic === id || !track.element.paused) return null;
      track.gain.gain.value = 0;
      var started = track.element.play();
      return started && started.then(function () { track.element.pause(); track.element.currentTime = 0; }).catch(function () {});
    }, this);
    return Promise.all([resumed].concat(primed));
  };

  /** Decode short effects ahead of time. Music is streamed and is skipped here. */
  SoundLib.prototype.preload = function (ids) {
    return Promise.all((ids || []).map(function (id) {
      return this.get(id).type === 'music' ? null : this._buffer(id);
    }, this));
  };

  SoundLib.prototype._buffer = function (id) {
    if (this._buffers[id]) return this._buffers[id];
    var context = this._audio();
    var url = this.urlOf(id);
    this._buffers[id] = fetch(url).then(function (response) {
      if (!response.ok) throw new Error('failed to load ' + url + ' (' + response.status + ')');
      return response.arrayBuffer();
    }).then(function (data) {
      return new Promise(function (resolve, reject) { context.decodeAudioData(data, resolve, reject); });
    });
    return this._buffers[id];
  };

  /** Free decoded effects that the current scene no longer needs. */
  SoundLib.prototype.release = function (ids) {
    (ids || Object.keys(this._buffers)).forEach(function (id) { delete this._buffers[id]; }, this);
  };

  /** Plays an effect, or switches to a music track, based on the sound's type. */
  SoundLib.prototype.play = function (id, options) {
    return this.get(id).type === 'music' ? this.playMusic(id, options) : this.playEffect(id, options);
  };

  SoundLib.prototype.playEffect = function (id, options) {
    options = options || {};
    var context = this._audio();
    var master = this.master;
    return this._buffer(id).then(function (buffer) {
      var source = context.createBufferSource();
      var gain = context.createGain();
      source.buffer = buffer;
      source.loop = !!options.loop;
      source.playbackRate.value = options.rate || 1;
      gain.gain.value = options.volume == null ? 1 : options.volume;
      source.connect(gain);
      gain.connect(master);
      source.start();
      return { stop: function () { try { source.stop(); } catch (error) { /* Already ended. */ } } };
    });
  };

  SoundLib.prototype.playMusic = function (id, options) {
    options = options || {};
    var asset = this.get(id);
    var fade = options.fade || 0;
    if (this._currentMusic && this._currentMusic !== id) this.stopMusic({ fade: fade });
    var track = this._track(id);
    var context = this._audio();
    var volume = options.volume == null ? 1 : options.volume;
    clearTimeout(track.stopTimer);
    track.element.loop = options.loop != null ? !!options.loop : !!asset.loop;
    this._currentMusic = id;
    track.gain.gain.cancelScheduledValues(context.currentTime);
    if (fade > 0) {
      track.gain.gain.setValueAtTime(0, context.currentTime);
      track.gain.gain.linearRampToValueAtTime(volume, context.currentTime + fade);
    } else {
      track.gain.gain.value = volume;
    }
    return track.element.play();
  };

  SoundLib.prototype.stopMusic = function (options) {
    options = options || {};
    var id = this._currentMusic;
    if (!id) return;
    var track = this._tracks[id];
    var context = this._audio();
    var fade = options.fade || 0;
    this._currentMusic = null;
    function stop() { track.element.pause(); track.element.currentTime = 0; }
    clearTimeout(track.stopTimer);
    if (fade > 0) {
      track.gain.gain.cancelScheduledValues(context.currentTime);
      track.gain.gain.setValueAtTime(track.gain.gain.value, context.currentTime);
      track.gain.gain.linearRampToValueAtTime(0, context.currentTime + fade);
      track.stopTimer = setTimeout(stop, fade * 1000);
    } else {
      stop();
    }
  };

  SoundLib.prototype.setVolume = function (volume) {
    this._audio();
    this.master.gain.value = volume;
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = SoundLib;
  global.SoundLib = SoundLib;
})(typeof window !== 'undefined' ? window : globalThis);
