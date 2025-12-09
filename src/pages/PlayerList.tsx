import React, { useEffect, useRef, useState } from 'react';
import PlayerService from '../services/PlayerService';
import { usePDF } from 'react-to-pdf';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Loader from "react-js-loader";
import TeamService from '../services/TeamService';
import playerPhoto from '../assets/playerPhoto.png'
import playerBg from '../assets/playerBg.jpeg'
import { BACKEND_URL } from '../constants';
import PDFCreator from './PDFCreator';
import InfiniteScroll from "react-infinite-scroll-component";



const PlayerList: React.FC = () => {
    const ref = useRef();
    const [isLoading, setIsLoading] = useState(false)
    const [players, setPlayers] = useState<any>([]);
    const [soldCount, setSoldCount] = useState(0);
    const [unSoldCount, setUnSoldCount] = useState(0);
    const [pendingCount, setPendingCount] = useState(0);
    const { toPDF, targetRef } = usePDF({filename: 'kbs_players.pdf'});
    const [selectedTeamId, setSelectedTeamId] = useState('')
    const [allTeams, setAllTeams] = useState<any>();
    const [offset, setOffset] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 600);


    const [items, setItems] = useState<any>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const calledRef = useRef(false);




    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 600);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

//     const fetchMoreData = async () => {
//     const res = await fetch(
//       `https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=10`
//     );
//     const data = await res.json();

//     if (data.length === 0) {
//       setHasMore(false);
//       return;
//     }

//     setItems((prev:any) => [...prev, ...data]);
//     setPage(prev => prev + 1);
//   };



    useEffect(()=>{
        if (calledRef.current) return;
  calledRef.current = true;
        GetAllPlayers();
        GetAllTeams();
        setPlayers([]);
        // GetAllPlayers(selectedTeamId);
    },[])

    const GetAllTeams = () =>{
        TeamService().getAllTeams().then((response:any)=>{
            setAllTeams(response?.data)
        })
    }
   const GetAllPlayers = async () => {
    // const GetAllPlayers = async (teamId:any) => {
        setIsLoading(true);
        try {
            let teamId = selectedTeamId;
            let params = {
                offset : page,
                teamId : teamId
            }
            PlayerService().getAllPlayers(params).then((response:any)=>{
                setIsLoading(false);
                // setPlayers(response?.data?.players);
                
                let playerList = response?.data?.players;
                
                setSoldCount(response?.data?.soldPlayerCount);
                setUnSoldCount(response?.data?.unSoldPlayerCount);
                setPendingCount(response?.data?.pendingPlayerCount);
                if (playerList && playerList.length === 0) {
                setHasMore(false);
                return;
                }
                if(playerList && playerList.length > 0){
                setItems((prev:any) => [...prev, ...playerList]);
                setPlayers((prev:any) => [...prev, ...playerList]);
                setPage(prev => prev + 10);
                }

            })
        } catch (error) {
            setIsLoading(false);
            console.error('Error fetching players:', error);
        }
    };

    // const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) =>{
    //     console.log("selectedItem-- ", event.target.value);
    //     setSelectedTeamId(event.target.value);
    //     GetAllPlayers();

    // }

    const downloadPdf = () =>{
        const pdfUrl = "Sample.pdf";
        const link = document.createElement("a");
        link.href = pdfUrl;
        link.download = "document.pdf"; // specify the filename
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const getPreviousPlayers = () =>{
        setOffset((prevOffset) => prevOffset - 4);

    }

    const getNextPlayers = () =>{
        setOffset((prevOffset) => prevOffset - 4);

    }

    return (
        <>
        <div style={{display:'flex'}}>
        <Header/>
        </div>
        
        {/* <div style={playerCountStyle}>
        {isLoading && <Loader type="spinner-cub" bgColor={'#194564'} color={'white'} title={"Loading Players..."} size={50} /> }
            <span style={{marginTop:'20px', color:'white'}}>
            Total Players : {players && players.length? players.length:0} | Unsold : {unSoldCount} | Sold : {soldCount} | Pending : {pendingCount} 
             |<select style={inputContainerStyle}
                    id="batting_style"
                    name="batting_style"
                    value={selectedTeamId}
                    onChange={handleChange}
                >
                    <option value="">--Select Team--</option>
                    {allTeams && allTeams.map((team:any, index:number) => (
                        <option key={index} value={team.id}>{team.team_name}</option>
                    ))}
                </select>
                <button style={{marginLeft:'20px'}} onClick={()=>getPreviousPlayers()}>Prev</button> 
             <button onClick={()=>getNextPlayers()}>Next</button>
            </span>
            <PDFCreator playerList={players}/>
            </div> */}

        <InfiniteScroll
      dataLength={items.length}   // ⚠️ mandatory
      next={GetAllPlayers}
      hasMore={hasMore}
      loader={<h4>Loading...</h4>}
      endMessage={<p style={{ textAlign: "center" }}>No more data</p>}
    >
      <div id='content-id' ref={targetRef}  style={playerListContainer}>
            {players.map((player:any, index:number) => (
                <>
                <div style={players__card__wrap} key={index}>
                    

                    <div style={{display:"flex"}}>
                    <img key={index} src={`https://storage.googleapis.com/auction-players/${player.profile_image}`} alt="logo" style={profileImageStyle}/>
                    </div>

                    <div style={{display:'flex',width:'146px',marginLeft:'30px',textAlign:'center'}}>
                        <span style={fullNameText}>{player.fullname.toUpperCase()}</span>
                    </div>
                    

                    <div style={cardHeader}>
                        
                        <div style={cardBodyTextStyle}> 

                        <div style={{display : "grid", textAlign:'center', marginTop : '-234px', width:'55px',marginLeft : '156px'}}>
                            <span style={{ ...idText }}>#{player.id}</span>
                        </div>

                        <div style={{display : "grid", marginTop : '32px', width:'129px',marginLeft : '208px',transform : 'rotate(10deg)'}}>
                            <span style={{ ...fullNameLabel}}>Player Role</span>
                            <span style={{ ...labelValue}}>{player.player_role}</span>
                        </div>

                         <div style={{display : "grid",  width:'129px',marginLeft : '203px', marginTop:'2px',transform : 'rotate(10deg)'}}>
                            <span style={{ ...fullNameLabel }}>Batting Style</span>
                                <span style={{ ...labelValue}}>{player.batting_style}</span>
                            </div>

                         <div style={{display : "grid",width:'129px',marginLeft : '198px',marginTop:'2px',transform : 'rotate(10deg)'}}>
                            <span style={{ ...fullNameLabel}}>Bowling Style</span>
                                <span style={{ ...labelValue}}>{player.bowling_style}</span>
                            </div>

                        <div style={{display : "grid", width:'129px',marginLeft : '193px',marginTop:'2px',transform : 'rotate(10deg)'}}>
                            <span style={{ ...fullNameLabel}}>Place</span>
                                <span style={{ ...labelValue }}>{player.location}</span>
                            </div>

                        <div style={{display : "grid",  width:'129px',marginLeft : '188px',marginTop:'2px',transform : 'rotate(10deg)'}}>
                            <span style={{ ...fullNameLabel}}>Contact</span>
                                <span style={{ ...labelValue}}>{player.contact_no}</span>
                            </div>
                            
                        </div>
                    </div>
                    <div style={cardFooter}>

                    </div>
                </div>
                </>
            ))}
        </div>
    </InfiniteScroll>



        {isLoading && <Loader type="spinner-cub" bgColor={'#FFBF00'} color={'#FFBF00'} title={"Loading Players..."} size={50} /> }

        {/* {(players )&&
        
        } */}



        {/* <Footer/> */}
        </>
    )
}

const playerListContainer: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(25rem, 1fr))',
    gap: '2rem',
    // maxWidth: '120rem',
    margin: '0 auto',
    padding: '2rem',
    backgroundColor:'#001840',
    // width: "100%",
    //  height: "600px", 
    // overflow: "hidden",
    // display: "flex",
    //     alignItems: "center",
    //     justifyContent: "center"
}

const cardIconTextStyle: React.CSSProperties = {
    padding: '10px',
    cursor: 'pointer',
    color: 'yellow',
    textAlign: 'left',
    fontSize: '50px',
    textShadow: "1px 1px 0 #f00, 2px 2px 0 #f00, 3px 3px 0 #f00",
    fontWeight:"bolder",
    fontStyle:'italic'
  };

const cardSubHeader : React.CSSProperties = {
    fontSize: '25px',
    fontFamily: 'auto',
    marginTop: '11px',
    // textAlign: 'center',
    border: "2px solid #ccc",
    borderRadius: "8px",
    // width: "130px",
    backgroundColor: "antiquewhite",
    color : "black",
    padding:"3px",
    marginLeft:"125px",
    height:"fit-content"
}


const cardHeaderTextStyle: React.CSSProperties = {
    gap: '2rem',
    cursor: 'pointer',
    // color: 'yellow',
    textAlign: 'center',
    fontSize: '23px',
    // textShadow: '1px 1px 0 #999, 2px 2px 0 #999, 3px 3px 0 #999',
    fontFamily: "Arial,Helvetica, sans-serif",
    justifyContent:'center'
    
  };

  const cardBodyTextStyle: React.CSSProperties = {
    color: 'black',
    textAlign: 'left',
    fontSize: '25px',
    paddingLeft:"10px"
  };

const n05IconStyle : React.CSSProperties = {
    display:'flex', justifyContent:'end', marginLeft:"95px"
}

const imageStyle1 : React.CSSProperties = {
    height : '7rem',
    width: '7rem',
    padding:'5px',
    // borderRadius: '13px',
    // objectFit: 'cover',
    // border: 'none'
    // marginLeft:"-15px",
    // marginTop:"-122px"
}

const spanText :  React.CSSProperties = {
    marginTop: '-170px', 
    // fontWeight: 'bold', 
    fontSize: '20px',
    paddingLeft : '183px',
    color:'white'
    // paddingTop : '8px'
}

const spanText1 :  React.CSSProperties = {
    marginTop: '127px', 
    // fontWeight: 'bold', 
    fontSize: '16px',
    paddingLeft : '52px',
    color : 'goldenrod',
    // paddingTop : '8px'
    transform : 'rotate(12deg)'
}

const fullNameText :  React.CSSProperties = {
    marginTop: '6px', 
    fontWeight: '600', 
    fontSize: '16px',
    // paddingLeft : '114px',
    color:"maroon",
    // marginLeft : '-78px',
    width : '146px',
    fontStyle:'italic',
    height:'42px'
}

const fullNameLabel : React.CSSProperties = {
    // marginTop: '15px', 
    fontWeight: 'bold', 
    fontSize: '12px',
    // paddingLeft : '52px',
    color:"maroon",
    // transform : 'rotate(10deg)',
    
}

const idText :  React.CSSProperties = {
    // marginTop: '15px', 
    fontWeight: 'bold', 
    fontSize: '18px',
    // paddingLeft : '52px',
    color:"maroon",
    fontStyle : 'italic'
    
}


const labelValue :  React.CSSProperties = {
    // marginTop: '15px', 
    fontWeight: 'bold', 
    fontSize: '12px',
    // paddingLeft : '52px',
    color:"black",
    // transform : 'rotate(10deg)',
    
}

const svgStyle :React.CSSProperties = {
    height : '1rem',
    width: '1rem',
    objectFit:'cover',
    padding:'10px',
    filter: 'invert(85%) sepia(20%) saturate(150%) hue-rotate(200deg) brightness(120%) contrast(120%)'

}

const profileImageStyle : React.CSSProperties = {
    height: '11rem',
    width: '8.5rem',
    // padding: '5px',
    alignItems: 'flex-start',
    // display: 'grid',
    marginLeft: '38px',
    objectFit:'cover',
    // borderRadius : "10px",
    marginTop:"190px",
    // clipPath: "path('M0 0 H160 Q160 40 200 40 V200 H0 Z')"
    clipPath: "path('M 0 0 H 126 Q 135 40 200 40 V 225 H 0 Z')"
    // borderImage: "linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 10%)",
//   WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,2) 10%)",
//   maskImage: "linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 20%)",
//   maskImage: "linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 20%, rgba(0,0,0,1) 80%, rgba(0,0,0,0) 100%), linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 20%)",
//   maskComposite: "intersect",
  
}

const players__card__wrap :  React.CSSProperties = {
    gap: '2rem',
    // backgroundImage: 'linear-gradient(to top,  #DE3163	, #000080	)',
    // backgroundImage :"linear-gradient(#194564,#4c8dba, #194564)",
    backgroundImage : `url(${playerBg})`,
    border: '1px solid #ccc', 
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', 
    borderRadius: '8px', 
    margin: '0 auto',
    marginTop:'25px',
    // backgroundColor:"#d4af37"
    width: "361px",
    height: "510px",
    // objectFit :"cover"
  }

const no5Style : React.CSSProperties = {
    height : "3rem",
    width : "4rem",
    // borderRadius : "50%",
    padding:"5px",
    marginLeft:"15px",
    marginTop:"-35px"

}

const cardHeader :  React.CSSProperties = {
    display: 'flex',
    justifyContent:'flex-start'
}

const cardFooter :  React.CSSProperties = {
    display: 'flex',
    backgroundColor : 'purple',
    marginBottom:'10px'
}

const playerCountStyle : React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor:'#d4af37'
}

const inputContainerStyle: React.CSSProperties = {
    flexBasis: "48%",
    height: "2rem",
    border: "2px solid #ccc",
    borderRadius: "8px",
    margin:'5px',
    // width : '80%'
  };

const cardTitleStyle : React.CSSProperties = {
    fontSize: '30px',
    fontFamily: 'auto',
    marginTop:'8px',
    textAlign: 'center',
    background: "linear-gradient(to top, #f32170, #ff6b08,#cf23cf, #eedd44)",
    WebkitTextFillColor: "transparent",
    WebkitBackgroundClip: "text",
    marginLeft:"10px"
    
}

const isMobile = window.matchMedia("(max-width: 600px)").matches;
    if (isMobile) {
        playerCountStyle.fontSize = '12px'; // Adjust font size for mobile view
        playerCountStyle.padding = '10px'

        playerListContainer.gridTemplateColumns =  'repeat(auto-fit, minmax(18rem, 1fr))'
        playerListContainer.padding =  '0rem'

        // players__card__wrap.margin = '10px'

        cardIconTextStyle.fontSize = "35px"
        cardIconTextStyle.marginTop = "1px";

        cardSubHeader.fontSize = '20px';
        cardTitleStyle.fontSize = '26px';

        spanText.paddingLeft = '5px';
        n05IconStyle.marginLeft = '80px'
        no5Style.marginTop = '5px'

    }


export default PlayerList;