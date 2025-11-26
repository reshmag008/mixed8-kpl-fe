import React, { useEffect, useState } from "react";
import PlayerService from "../services/PlayerService";
import S3Service from "../services/s3Service";
import Header from "../components/Header";
import Footer from "../components/Footer";
import 'react-image-crop/dist/ReactCrop.css'
import Loader from "react-js-loader";
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";
import ReactCrop, { type Crop,
  centerCrop,
  makeAspectCrop,
  PixelCrop,
  convertToPixelCrop
 } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css';
import Cropper from 'react-easy-crop'
import getCroppedImg from '../services/cropImage';
import axios from 'axios'
import {buttonColor} from '../constants'




const PlayerRegistration: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File|null>(null);
  const [openPopUp, setOpenPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // const [crop, setCrop] = useState<Crop>({
  //   unit: '%', // Can be 'px' or '%'
  //   x: 25,
  //   y: 25,
  //   width: 50,
  //   height: 50
  // })

  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [croppedImage, setCroppedImage] = useState(null)


  const [formData, setFormData] = useState({
    fullname: "",
    location: "",
    jersey_name: "",
    jersey_size: "",
    jersey_no: "",
    profile_link: "",
    contact_no: "",
    whatsapp_no: "",
    player_role: "",
    batting_style: "",
    bowling_style: "",
    profile_image: "",
    un_sold:false
  });

  const [errors, setErrors] = useState({
    fullname: "",
    location: "",
    jersey_name: "",
    jersey_size: "",
    jersey_no: "",
    contact_no: "",
    whatsapp_no: "",
    player_role: "",
    batting_style: "",
    bowling_style: "",
    selectedImage:''
  });

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);

  useEffect(() => {
    const handleResize = () => {
        setIsMobile(window.innerWidth <= 600);
    };

    window.addEventListener('resize', handleResize);

    return () => {
        window.removeEventListener('resize', handleResize);
    };
}, []);


  const handleChange = (e: React.ChangeEvent<HTMLSelectElement> | React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log("name== ", name)
    console.log("value== ", value)
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' })
    
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    try{
    setIsLoading(true);
    e.preventDefault();
    if (validateForm()) {
      console.log('Form submitted successfully:', formData);
      formData.profile_image = formData.fullname + "_" + formData.contact_no + ".jpeg";
      PlayerService().addPlayer(formData).then((response:any)=>{
        console.log("response== ", response);
        if(response.data){
          toast.success('Player Registered Succesfully', { autoClose: 2000 })
          playerImageUpload(response.data.id);
          resetData();
        }else{
          setIsLoading(false);
          toast.error('Registration Failed',{ autoClose: 2000 })
        }
      }).catch((err:any)=>{
        console.log("err========= ", err)
        setIsLoading(false);
        if(err.response && err.response.data && err.response.data.name && err.response.data.name === "SequelizeUniqueConstraintError" ){
          toast.error('Player Already Exists',{ autoClose: 2000 })
        }else{
          toast.error('Unable to process your request. Pls try again later',{ autoClose: 2000 })
        }
      })

      // Perform form submission here
    }else{
      setIsLoading(false);
    }
  }catch(err){
    console.log("err")
    setIsLoading(false);
    toast.error('Player Alreday Exists',{ autoClose: 2000 })
  }
  };

  const playerImageUpload = async (playerId:any) => {
    try{
    const formFileData = new FormData()
    if(selectedImage){
      formFileData.append('file_name', formData.fullname + "_" + formData.contact_no + ".jpeg",)
      formFileData.append('player_id', playerId)
      formFileData.append('file', selectedImage)
    
    // PlayerService().PlayerImageUpload(formFileData).then((response:any)=>{
    //   console.log("response== ", response);
    //   resetData();
    //     setIsLoading(false);
    // })

    // await PlayerService().PlayerImageGoogleUpload(formFileData);

    await PlayerService().PlayerImageGoogleStorageCloudUpload(formFileData);
    setIsLoading(false);

    // const uploadFile = async () => {
  //   const form = new FormData();
  //   form.append("file", selectedImage);

  //   const res = await axios.post("http://localhost:8443/gcsupload", form, {
  //     headers: { "Content-Type": "multipart/form-data" }
  //   });
  //   console.log("File URL:", res.data.url);
  // }

    
  };
}catch(err){
  setIsLoading(false);
}


   
  }


  // const getPresignedUrl = () => {
  //   let file = selectedImage;
  //   console.log("selectedImage== ", selectedImage);
  //   console.log("file== ", file);
  //     let params = {
  //       key: formData.fullname + "_" + formData.contact_no + ".jpeg",
  //       contentType: selectedImage?.type,
  //       bucket: "palloor-players",
  //     };

  //     S3Service().GetPresignedUrl(params).then((response:any)=>{
  //       console.log("upload url for  Player response== ", response);
  //       resetData();
  //       setIsLoading(false);
  //         const xhr = new XMLHttpRequest();
  //         xhr.open("PUT", response.data, true);
  //         if(file!==null)xhr.setRequestHeader("Content-Type", file.type);
  //         xhr.onreadystatechange = function () {
  //           if (xhr.readyState === 4) {
  //             if (xhr.status === 200) {
  //               return "success";
  //             } else {
  //               console.error("Error occurred while uploading file.");
  //               return "failed";
  //             }
  //           }
  //         };
  //         let res = xhr.send(file);
  //         console.log("res== ", res);
  //     })
  // }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
      // setOpenPopup(true);
    }
  };
  
  const resetData = () => {
    setFormData({
      fullname: "",
      location: "",
      jersey_name: "",
      jersey_size: "",
      jersey_no: "",
      profile_link: "",
      contact_no: "",
      whatsapp_no: "",
      player_role: "",
      batting_style: "",
      bowling_style: "",
      profile_image: "",
      un_sold:false
    })
    setSelectedImage(null);
  }


    const validateForm = (): boolean => {
      let valid = true;
      const { fullname, location,jersey_name,jersey_size,jersey_no,contact_no,whatsapp_no,player_role,batting_style,
        bowling_style} = formData;
      const newErrors = {
        fullname:'',
        location: '',
        jersey_name: "",
        jersey_size: "",
        jersey_no: "",
        contact_no: "",
        whatsapp_no: "",
        player_role: "",
        batting_style: "",
        bowling_style: "",
        selectedImage: "",
      };

      if (!fullname.trim()) {
        newErrors.fullname = 'Fullname is required';
        valid = false;
      }

      if (!location.trim()) {
        newErrors.location = 'Location is required';
        valid = false;
      }

      // if (!jersey_name.trim()) {
      //   newErrors.jersey_name = 'Jersey Name is required';
      //   valid = false;
      // }

      // if (!jersey_size.trim()) {
      //   newErrors.jersey_size = 'Jersey Size is required';
      //   valid = false;
      // }
      // if (!jersey_no.trim()) {
      //   newErrors.jersey_no = 'Jersey No is required';
      //   valid = false;
      // }
      if (!contact_no.trim()) {
        newErrors.contact_no = 'Contact Number is required';
        valid = false;
      }
      if (!whatsapp_no.trim()) {
        newErrors.whatsapp_no = 'Whatsapp Number is required';
        valid = false;
      }
      if (!player_role.trim()) {
        newErrors.player_role = 'Player Role is required';
        valid = false;
      }
      if (!batting_style.trim()) {
        newErrors.batting_style = 'Batting Style is required';
        valid = false;
      }
      if (!bowling_style.trim()) {
        newErrors.bowling_style = 'Bowling Style is required';
        valid = false;
      }
      if (!selectedImage) {
        newErrors.selectedImage = 'Profile Image is required';
        valid = false;
      }

      setErrors(newErrors);
      return valid;
    };


    const onImageLoad = (e:any) => {
      const { naturalWidth: width, naturalHeight: height } = e.currentTarget
    
      const crop = centerCrop(
        makeAspectCrop(
          {
            // You don't need to pass a complete crop into
            // makeAspectCrop or centerCrop.
            unit: '%',
            width: 90,
          },
          16 / 9,
          width,
          height
        ),
        width,
        height
      )
    
      setCrop(crop)
    }

    const onCropComplete = (croppedArea:any, croppedAreaPixels:any) => {
      setCroppedAreaPixels(croppedAreaPixels)
    }

    // const showCroppedImage = async () => {
    //   try {
    //     const croppedImage = await getCroppedImg(
    //       selectedImage,
    //       croppedAreaPixels,
    //       rotation
    //     )
    //     console.log('donee', { croppedImage })
    //     setCroppedImage(croppedImage)
    //   } catch (e) {
    //     console.error(e)
    //   }
    // }



  return (
    <>

    {openPopUp && 
            <div style={overlay}>
              <div style={popUpStyle} >
                <div>
                  {/* <button style={buttonStyle} type="submit" onClick={showCroppedImage}>Done</button> */}
                </div>
                {selectedImage && (
                  // <ReactCrop crop={crop} onChange={c => setCrop(c)}>
                  //     <img src={URL.createObjectURL(selectedImage)}  />
                  // </ReactCrop>

                  <Cropper
                    image={URL.createObjectURL(selectedImage)}
                    crop={crop}
                    rotation={rotation}
                    zoom={zoom}
                    aspect={4 / 3}
                    onCropChange={setCrop}
                    onRotationChange={setRotation}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                  />

                )}
              </div>
            </div>
    }

    <Header/>
    
    <div style={formContainerStyle}>

    <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark" />



      <form onSubmit={handleSubmit} style={{margin:'20px'}}>

        <h3 style={{color:'#FFBF00',padding:'10px'}}>Player Registration</h3>

        <div style={{gridTemplateColumns :  'repeat(auto-fit, minmax(25rem, 1fr))', display:"grid"}}>
          
            <div style={formColumnStyle}>

              <div style={{display:"flex"}}>
                <span style={labelTextStyle}>Full Name</span>
              </div>
              
              <input
                style={inputContainerStyle}
                placeholder="Fullname"
                type="text"
                id="fullname"
                name="fullname"
                value={formData.fullname}
                onChange={handleChange}
              />
              <span style={errorStyle}>{errors.fullname}</span>
            </div>

            <div style={formColumnStyle}>
            
            <div style={{display:"flex"}}>
                <span style={labelTextStyle}>Location</span>
              </div>


            <input
              style={inputContainerStyle}
              placeholder="Location"
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
            <span style={errorStyle}>{errors.location}</span>

            </div>

            {/* <div style={formColumnStyle}>

              <div style={{display:"flex"}}>
                <span style={labelTextStyle}>Jersey Name</span>
              </div>

            
                <input
                  style={inputContainerStyle}
                  placeholder="Jersey Name"
                  type="text"
                  id="jersey_name"
                  name="jersey_name"
                  value={formData.jersey_name}
                  onChange={handleChange}
                />
                <span style={errorStyle}>{errors.jersey_name}</span>

                </div> */}

                {/* <div style={formColumnStyle}>
              
                <div style={{display:"flex"}}>
                <span style={labelTextStyle}>Jersey No</span>
              </div>

                <input
                  style={inputContainerStyle}
                  placeholder="Jersey No"
                  type="text"
                  id="jersey_no"
                  name="jersey_no"
                  value={formData.jersey_no}
                  onChange={handleChange}
                />
                <span style={errorStyle}>{errors.jersey_no}</span>

            </div> */}

            {/* <div style={formColumnStyle}>

              <div style={{display:"flex"}}>
                <span style={labelTextStyle}>Jersey Size</span>
              </div>

                <input
                  style={inputContainerStyle}
                  placeholder="Jersey Size"
                  type="text"
                  id="jersey_size"
                  name="jersey_size"
                  value={formData.jersey_size}
                  onChange={handleChange}
                />
                <span style={errorStyle}>{errors.jersey_size}</span>

                </div> */}
                
                {/* <div style={formColumnStyle}>

                <div style={{display:"flex"}}>
                  <span style={labelTextStyle}>Profile Link</span>
                </div>

                
                <input
                  style={inputContainerStyle}
                  placeholder="Profile Link"
                  type="text"
                  id="profile_link"
                  name="profile_link"
                  value={formData.profile_link}
                  onChange={handleChange}
                />

            </div> */}

            <div style={formColumnStyle}>

            
                <div style={{display:"flex"}}>
                  <span style={labelTextStyle}>Contact No</span>
                </div>

            <input
              style={inputContainerStyle}
              placeholder="Contact No"
              type="text"
              id="contact_no"
              name="contact_no"
              value={formData.contact_no}
              onChange={handleChange}
              maxLength={10}
            />
            <span style={errorStyle}>{errors.contact_no}</span>

            </div>
            <div style={formColumnStyle}>

            

            <div style={{display:"flex"}}>
                <span style={labelTextStyle}>WhatsApp No</span>
            </div>


            <input
              style={inputContainerStyle}
              placeholder="WhatsApp No"
              type="text"
              id="whatsapp_no"
              name="whatsapp_no"
              value={formData.whatsapp_no}
              onChange={handleChange}
              maxLength={10}
            />
            <span style={errorStyle}>{errors.whatsapp_no}</span>

            </div>


            <div style={formColumnStyle}>

            
            <div style={{display:"flex"}}>
                <span style={labelTextStyle}>Player Role</span>
            </div>


                <select style={inputContainerStyle}
                    id="player_role"
                    name="player_role"
                    value={formData.player_role}
                    onChange={handleChange}
                >
                    <option value="">--Select Role--</option>
                    <option value="Batter">Batter</option>
                    <option value="Bowler">Bowler</option>
                    <option value="All Rounder">All Rounder</option>
                    <option value="Wicket Keeper">Wicket Keeper</option>
                    <option value="WK/Batter">WK/Batter</option>
                </select>
                <span style={errorStyle}>{errors.player_role}</span>

                </div>
                <div style={formColumnStyle}>

                

                <div style={{display:"flex"}}>
                    <span style={labelTextStyle}>Batting Style</span>
                </div>

                <select style={inputContainerStyle}
                    id="batting_style"
                    name="batting_style"
                    value={formData.batting_style}
                    onChange={handleChange}
                >
                    <option value="">--Select Batting Style--</option>
                    <option value="Nil">Nil</option>
                    <option value="Right Hand">Right Hand</option>
                    <option value="Left Hand">Left Hand</option>
                </select>
                <span style={errorStyle}>{errors.batting_style}</span>

            </div>

            <div style={formColumnStyle}>

            <div style={{display:"flex"}}>
                    <span style={labelTextStyle}>Bowling Style</span>
                </div>

            
              <select style={inputContainerStyle}
                  id="bowling_style"
                  name="bowling_style"
                  value={formData.bowling_style}
                  onChange={handleChange}
              >
                  <option value="">--Select Bowling Style--</option>
                  <option value="Nil">Nil</option>
                  <option value="Right Hand">Right Hand</option>
                  <option value="Left Hand">Left Hand</option>
              </select>
              <span style={errorStyle}>{errors.bowling_style}</span>

              </div>

              <div style={formColumnStyle}>

              
              <div style={{display:"flex"}}>
                    <span style={labelTextStyle}>Profile Image</span>
                </div>


              <input style={inputContainerStyle} 
              placeholder="Select Image"
              id="profile_image"
              name="profile_image"
              type="file" accept="image/*" onChange={handleImageChange} />
            <span style={errorStyle}>{errors.selectedImage}</span>

            </div>

            <div style={formColumnStyle}>
            

            {selectedImage && (
                <div >
                {/* <h3>Preview:</h3> */}
                <img src={URL.createObjectURL(selectedImage)} alt="Selected" style={profileImageStyle} />
                </div>
            )}

            </div>

          
          </div>
          {!isLoading && <button style={buttonStyle} type="submit">Register</button> }
          {isLoading && <Loader type="spinner-cub" bgColor={'#009F4D'} color={'#009F4D'} title={"Registering Player..."} size={50} /> }
      </form>
    </div>


    <Footer/>
    </>
  );
};

const svgStyle :React.CSSProperties = {
  height : '1.5rem',
  width: '1.5rem',
  marginTop:'7px',
  marginLeft:'20px'

}

const overlay : React.CSSProperties={
  position: 'fixed',
top: '0',
left: "0",
width: "100%",
height:" 100%",
backgroundColor: 'rgba(18, 15, 17, 0.85)', /* Semi-transparent black */
zIndex: '1000'
}

const popUpStyle: React.CSSProperties = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '10px',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
};


const formContainerStyle: React.CSSProperties = {
  // width: "100%",
  border: '3px solid #FFBF00', 
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', 
  // borderRadius: '8px', 
  textAlign:'center',
  // display:'grid',
  // margin:'100px',
  backgroundColor : "#001840",
  marginTop : "56px",
  height : "36.1rem"
};

const formColumnStyle: React.CSSProperties = {
    display:'grid',
    // justifyContent:'center',
    padding:'10px'
    // 
};

const inputContainerStyle: React.CSSProperties = {
  flexBasis: "48%",
  height: "2rem",
  border: "2px solid #ccc",
  borderRadius: "8px",
  margin:'5px',
  // width : '80%'
};

const buttonStyle : React.CSSProperties = {
  backgroundColor: buttonColor ,
  color: '#FFBF00',
  padding: '5px 15px',
  borderRadius: '5px',
  outline: '0',
  border: '0',
  textTransform: 'uppercase',
  margin: '10px 0px',
  cursor: 'pointer',
  boxShadow: '0px 2px 2px lightgray',
  transition: 'background-color 250ms ease',
  opacity:  1,
}

const errorStyle: React.CSSProperties = {
  color: "red",
  display:'flex',
  marginLeft:'5px'
};

const profileImageStyle : React.CSSProperties = {
  height: '17rem',
  width: '12rem',
  padding: '5px',
  alignItems: 'flex-start',
  display: 'grid',
  marginTop: '-10px',
  objectFit:'cover',
}

const labelTextStyle : React.CSSProperties = {
  padding:'10px',
  color:'#FFBF00',
  fontWeight:'600'
}

// const screenWidth = window.innerWidth;
// console.log("screenWidth=== ",screenWidth)
// if (screenWidth <= 360) {
//   console.log("<=360 px");
//   formContainerStyle.marginTop = "0px";
//   formContainerStyle.marginBottom = "50px";
//   formContainerStyle.width = "115%";
//   formContainerStyle.height = "130%";
//   inputContainerStyle.width = "87%";

// } else if (screenWidth <= 480) {
//   console.log("<=480 px");
//   formContainerStyle.marginTop = "0px";
//   formContainerStyle.marginBottom = "50px";
//   formContainerStyle.width = "100%";
//   formContainerStyle.height = "100%";
//   inputContainerStyle.width = "87%";
  

// } else if (screenWidth <= 600) {
//   console.log("<=600 px");
//   formContainerStyle.marginTop = "0px";
//   formContainerStyle.marginBottom = "80px";
//   formContainerStyle.width = "100%";
//   formContainerStyle.height = "100%";
//   inputContainerStyle.width = "87%";
// }




export default PlayerRegistration;
