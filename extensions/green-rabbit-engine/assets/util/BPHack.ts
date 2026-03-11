
/**
 * spine 预览
 */
if (CC_EDITOR) {
    // @ts-ignore
    sp.Skeleton.prototype.update = function (dt) {
        if (CC_EDITOR) {
            cc.engine["_animatingInEditMode"] = 1;
            cc.engine["animatingInEditMode"] = 1;
        }
        if (this.paused) return;

        // @ts-ignore
        dt *= this.timeScale * sp.timeScale;

        if (this.isAnimationCached()) {

            // Cache mode and has animation queue.
            if (this._isAniComplete) {
                if (this._animationQueue.length === 0 && !this._headAniInfo) {
                    let frameCache = this._frameCache;
                    if (frameCache && frameCache.isInvalid()) {
                        frameCache.updateToFrame();
                        let frames = frameCache.frames;
                        this._curFrame = frames[frames.length - 1];
                    }
                    return;
                }
                if (!this._headAniInfo) {
                    this._headAniInfo = this._animationQueue.shift();
                }
                this._accTime += dt;
                if (this._accTime > this._headAniInfo.delay) {
                    let aniInfo = this._headAniInfo;
                    this._headAniInfo = null;
                    this.setAnimation (0, aniInfo.animationName, aniInfo.loop);
                }
                return;
            }

            this._updateCache(dt);
        } else {
            this._updateRealtime(dt);
        }
    };

    // @ts-ignore
    dragonBones.ArmatureDisplay.isAnimationCached = function () {
        return this._cacheMode !== dragonBones.ArmatureDisplay.AnimationCacheMode.REALTIME;
    }
}

/**
 * 
 */
cc.Tween.prototype.setTimeScale = function (timeScale: number) {
    this._finalAction?.setSpeed(timeScale);
}

/**
 * 
 */
cc.Tween.prototype.clear = function () {
    this.stop();
    this._actions = [];
}