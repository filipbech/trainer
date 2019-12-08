
let promise: Promise<any>|undefined;

export const ensureApi = () => {
    if (promise) {
        return promise;
    }
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);

    promise = new Promise((res, rej) => {
        tag.onerror = rej;
        window['onYouTubeIframeAPIReady'] = function() {
            res();
        };
    });

    return promise;
}