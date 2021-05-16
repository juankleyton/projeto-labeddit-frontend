import React, {useState, useEffect} from 'react'
import { useHistory, useParams } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components'
import useForm from './useForm';
import { EatLoading } from 'react-loadingg';
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import Button from "@material-ui/core/Button";
import Input from '@material-ui/core/Input';
import TextField from '@material-ui/core/TextField';
import Header from './Header'

// const DivVoteComments = styled.div`
//     display: flex;
//     justify-content: space-evenly;
// `

const FormComment = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  height: 200px;
`

// const FormComment = styled.form`
//     display: flex;
//     flex-direction: column;
//     width: 25%;
// `

// const DivVote = styled.div`
//     display: flex;
//     justify-content: space-between;
//     width: 70px;
// `

// const DivVoteToComment = styled.div`
//     display: flex;
//     justify-content: space-evenly;
//     width: 20%;
//     margin: 0 auto;
// `

const DivContainer = styled.div`
  display: grid;
  gap: 20px;
  justify-items: center;
  align-items: center;
  /* max-width: 100px; */
`

const DivCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 100px;
`

// const DivPost = styled.div`
//     border: 1px solid black;
//     width: 25%;
//     text-align: center;
//     margin-top: 32px;
//     margin-bottom: 32px;
// `

function FeedDetailPage () {

    const [postDetail, setpostDetail] = useState([])
    const [comments, setComments] = useState([])

    const history = useHistory()
    const params = useParams()

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const token = window.localStorage.getItem("token")

        if(token === null){
            history.push("/login")
        }else{
            getPostDetail()
        }
    },[history])

    const { form, onChange, resetForm } = useForm({
        comment:''
      });
    
      const handleInputChange = (event) => {
        const { name, value } = event.target;
    
        onChange(name, value);
      };

      const handleLogout = () => {
        window.localStorage.clear();
        history.push("/");
      };

      const onClickPosts = postId => {
        history.push(`/feed`)
      }

    const getPostDetail = () => {
        const token = window.localStorage.getItem("token")
        setIsLoading(true);
        axios.get(`https://us-central1-labenu-apis.cloudfunctions.net/labEddit/posts/${params.postId}`, {headers:{
            Authorization: token
            }
        }).then( response => {
            setpostDetail(response.data.post)
            setComments(response.data.post.comments)
            setIsLoading(false);
        }).catch(error => {
            console.log(error.message)
        })
    }
   
      const handleComment = event => {
        event.preventDefault();
        const token = window.localStorage.getItem("token")
        const body = {
          "text": form.comment
        }
        axios.post(`https://us-central1-labenu-apis.cloudfunctions.net/labEddit/posts/${postDetail.id}/comment`,body,{headers: {
          Authorization: token
        }}).then(() => {
            alert("Comentário criado com sucesso!")
            resetForm()
            getPostDetail()
        }).catch(() => {
          alert("Erro ao criar comentário.")
        })
      };

      const putVotesComment = (postId, commentId, decision, userVoteDirection) => {
        const token = window.localStorage.getItem("token")
        let body = {};
        if (userVoteDirection === decision) {
          body = { direction: 0 };
        } else {
          body = { direction: decision};
        }
        axios.put(`https://us-central1-labenu-apis.cloudfunctions.net/labEddit/posts/${postId}/comment/${commentId}/vote`, body, {headers: {
        Authorization: token
      }}).then(() => {
            getPostDetail()
          })
          .catch((err) => {
            alert("Erro ao computar voto!")
          });
      };

      const putVotes = (postId, decision, userVoteDirection) => {
        const token = window.localStorage.getItem("token")
        let body = {};
        if (userVoteDirection === decision) {
          body = { direction: 0 };
        } else {
          body = { direction: decision};
        }
        axios.put(`https://us-central1-labenu-apis.cloudfunctions.net/labEddit/posts/${postDetail.id}/vote`, body, {headers: {
        Authorization: token
      }}).then(() => {
        getPostDetail();
          })
          .catch((err) => {
            alert("Erro ao computar voto!")
          });
      };

    return(

      <DivContainer>

        <Header 
          onClick={handleLogout}
          onClickPosts = {onClickPosts}
        />
        <DivCard>
        <Card >
        
        {isLoading ? <EatLoading />:

        <CardContent>

          <CardActionArea>
            <Typography gutterBottom variant="h5" component="h2">
              <hr/>
              <p>{postDetail.username}</p>
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              <p>{postDetail.text}</p>
            </Typography>
          </CardActionArea>
          <CardActions>
            <Button size="small" color="primary" onClick={() => putVotes(postDetail.id, -1, postDetail.userVoteDirection)}>
              {postDetail.userVoteDirection !== 0 && postDetail.userVoteDirection !== 1 ? <ArrowDownwardIcon color="secondary"/> : <ArrowDownwardIcon color="action"/>}
            </Button>
              <p>{postDetail.votesCount}</p>
            <Button size="small" color="primary" onClick={() => putVotes(postDetail.id, 1, postDetail.userVoteDirection)}>
              {postDetail.userVoteDirection !== 0 && postDetail.userVoteDirection !== -1 ? <ArrowUpwardIcon color="primary"/> : <ArrowUpwardIcon color="action"/>}
            </Button>
              <p>{postDetail.commentsCount}</p>
            <Button size="small" color="primary">
              {postDetail.commentsCount <= 1 ? "Comentário" : "Comentários"}
            </Button>
          </CardActions>
          <hr/>
        {/* </CardContent> */}

        <FormComment onSubmit={handleComment}>
          <TextField 
            id="outlined-multiline-static"
            multiline
            rows={4}
            variant="outlined"
            placeholder="Escreva seu comentário"
            value={form.comment}
            name="comment"
            onChange={handleInputChange}
          />
          <Button variant="contained" color="primary" type="submit">Comentar</Button>
        </FormComment>
        {/* <CardContent> */}
          {comments.map(comment => {
            return (
              <div key={comment.id}>
                <CardActionArea>
                  <Typography gutterBottom variant="h5" component="h2">
                    <hr/>
                    <p>{comment.username}</p>
                  </Typography>
                  <Typography variant="body2" color="textSecondary" component="p">
                    <p>{comment.text}</p>
                  </Typography>
                </CardActionArea>
                <CardActions>

                  <Button size="small" color="primary" onClick={() => putVotes(comment.id, -1, comment.userVoteDirection)}>
                    {comment.userVoteDirection !== 0 && comment.userVoteDirection !== 1 ? <ArrowDownwardIcon color="secondary"/> : <ArrowDownwardIcon color="action"/>}
                  </Button>
                  <p>{comment.votesCount}</p>
                  <Button size="small" color="primary" onClick={() => putVotes(comment.id, 1, comment.userVoteDirection)}>
                  {comment.userVoteDirection !== 0 && comment.userVoteDirection !== -1 ? <ArrowUpwardIcon color="primary"/> : <ArrowUpwardIcon color="action"/>}
                  </Button>
                </CardActions>
                <hr/>
              </div>
            )
          })}
        </CardContent>
        }
      </Card>
      </DivCard>
    </DivContainer>
  );






      
    //     <DivContainer>
    //         {isLoading ? <EatLoading /> :
    //             <DivContainer>
    //                 <Header onClick={handleLogout}/>
    //                 <DivPost>
    //                     <hr/>
    //                     <p><strong>{postDetail.username}</strong></p>
    //                     <p>{postDetail.text}</p>
    //                     <DivVoteComments>
    //                         <DivVote>
    //                             <Button size="small" color="primary" onClick={() => putVotes(postDetail.id, -1, postDetail.userVoteDirection)}>
    //                                 {postDetail.userVoteDirection !== 0 && postDetail.userVoteDirection !== 1 ? <ArrowDownwardIcon color="secondary"/> : <ArrowDownwardIcon color="action"/>}
    //                             </Button>
    //                             <p>{postDetail.votesCount}</p>
    //                             <Button size="small" color="primary" onClick={() => putVotes(postDetail.id, 1, postDetail.userVoteDirection)}>
    //                                 {postDetail.userVoteDirection !== 0 &&  postDetail.userVoteDirection !== -1 ? <ArrowUpwardIcon color="primary"/> : <ArrowUpwardIcon color="action"/>}
    //                             </Button>
    //                         </DivVote>
    //                         <p>{postDetail.commentsCount} {postDetail.commentsCount <= 1 ? "Comentário" : "Comentários"}</p>
    //                     </DivVoteComments>
    //                 </DivPost>

    //                 <FormComment onSubmit={handleComment}>
    //                     <TextField 
    //                         id="outlined-multiline-static"
    //                         multiline
    //                         rows={4}
    //                         variant="outlined"
    //                         placeholder="Escreva seu comentário"
    //                         value={form.comment}
    //                         name="comment"
    //                         onChange={handleInputChange}
    //                     />
    //                     <Button variant="contained" color="primary">Comentar</Button>
    //                 </FormComment>

    //                 {comments.map(comment => {
    //                     return(
    //                         <DivPost key={comment.id}>
    //                             <p><strong>{comment.username}</strong></p>
    //                             <hr/>
    //                             <p>{comment.text}</p>
    //                             <hr/>
    //                             <DivVoteToComment>
    //                                 <Button size="small" color="primary" onClick={() => putVotesComment(postDetail.id, comment.id, -1, comment.userVoteDirection)}>
    //                                     {comment.userVoteDirection !== 0 && comment.userVoteDirection !== 1 ? <ArrowDownwardIcon color="secondary"/> : <ArrowDownwardIcon color="action"/>}
    //                                 </Button>
    //                                 <p>{comment.votesCount}</p>
    //                                 <Button size="small" color="primary" onClick={() => putVotesComment(postDetail.id, comment.id, 1, comment.userVoteDirection)}>
    //                                     {comment.userVoteDirection !== 0 && comment.userVoteDirection !== -1 ? <ArrowUpwardIcon color="primary"/> : <ArrowUpwardIcon color="action"/>}
    //                                 </Button>
    //                             </DivVoteToComment>
    //                         </DivPost>
    //                     )
    //                 })}
    //             </DivContainer>
    //         }
    //     </DivContainer>
    // )
}

export default FeedDetailPage