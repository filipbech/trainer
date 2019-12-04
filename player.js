<iframe width="560" height="315" src="https://www.youtube.com/embed/bEfCKGBJc6k?enablejsapi=1" frameborder="0" allow="autoplay"></iframe>




<button id="btn">play</button>


const iFrame = document.querySelector('iframe');
const msg = JSON.stringify({
    event: 'command',
    func: 'playVideo',
    args: []
  });

document.querySelector('#btn').addEventListener('click',e => {
	iFrame.contentWindow.postMessage(msg,'*');
console.log('test', msg);
})
