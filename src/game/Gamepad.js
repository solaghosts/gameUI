import upbuttonicon from '../game/assets/icons/up.png'
import rightbuttonicon from '../game/assets/icons/right.png'
import leftbuttonicon from '../game/assets/icons/left.png'
import downbuttonicon from '../game/assets/icons/down.png'

const Gamepad = () => {

    
  return (
    <>
       <div className="right-gamepad">
          <button id="upButton" className="button" style={{ border: 'none', cursor: 'pointer', position:'fixed', padding: 5, left:42, bottom:57, background:'#4c75fb', boxShadow: '0 5px 0 0 #24397D', borderRadius:5, outlineStyle:'none', backgroundImage: `url(${upbuttonicon})`, backgroundSize: 'cover', imageRendering:'pixelated', width:45, height:45}}>
          </button>

          <button id="rightButton"  style={{ border: 'none', cursor: 'pointer', position:'fixed', padding: 5, left:82, bottom:37, background:'#4c75fb', boxShadow: '0 5px 0 0 #24397D', borderRadius:5, outlineStyle:'none', backgroundImage: `url(${rightbuttonicon})`, backgroundSize: 'cover',imageRendering:'pixelated', width:45, height:45}}>
          </button>


          <button id="leftButton"  style={{ border: 'none', cursor: 'pointer', position:'fixed', padding: 5, left:7, bottom:37, background:'#4c75fb', boxShadow: '0 5px 0 0 #24397D', borderRadius:5, outlineStyle:'none', backgroundImage: `url(${leftbuttonicon})`, backgroundSize: 'cover',imageRendering:'pixelated', width:45, height:45}}>
          </button>

          <button id="downButton"  style={{ border: 'none', cursor: 'pointer', position:'fixed', padding: 5, left:42, bottom:12, background:'#4c75fb', boxShadow: '0 5px 0 0 #24397D', borderRadius:5, outlineStyle:'none', backgroundImage: `url(${downbuttonicon})`, backgroundSize: 'cover',imageRendering:'pixelated', width:45, height:45}}>
          </button>
        </div>

        <div className="left-gamepad">
            <button id="qButton" style={{ fontFamily:'VT323', color:'white', fontSize:'1.875rem', lineHeight: '2.25rem', border: 'none', cursor: 'pointer', position:'fixed', padding: 10, right:15, bottom:45, background:'#4c75fb', boxShadow: '0 5px 0 0 #24397D', borderRadius:10 , outlineStyle:'none', zIndex:'1'}}>
            Q
            </button>
            <button id="eButton"  style={{ fontFamily:'VT323', color:'white', fontSize:'1.875rem', lineHeight: '2.25rem', border: 'none', cursor: 'pointer', position:'fixed', padding: 10, right:55, bottom:20, background:'#4c75fb', boxShadow: '0 5px 0 0 #24397D', borderRadius:10, outlineStyle:'none', zIndex:'1'}}>
            E
            </button>
        </div>
    </>
  );
};
  
  export default Gamepad;