import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { baseURL } from './constants';
import axios from 'axios';
import styled from 'styled-components'
import { EatLoading } from 'react-loadingg';
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import useForm from './useForm';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import Input from '@material-ui/core/Input';
import TextField from '@material-ui/core/TextField';
import Header from './Header';

const DivContainer = styled.div`
  display: grid;
  gap: 20px;
  justify-items: center;
`

const FormPost = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  height: 200px;
`

const useStyles = makeStyles({
  root: {
    maxWidth: 345
  },
  media: {
    height: 140
  }
});

const FeedPage = (props) => {
  const history = useHistory();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const classes = useStyles(); 

  const handleLogout = () => {
    window.localStorage.clear();
    history.push("/");
  };

  useEffect(() => {
    if (localStorage.getItem('token') === null) {
      history.push('/');
    }
  });

  useEffect(() => {
    getListPost()
  }, []);

  const { form, onChange, resetForm } = useForm({
    text:'',
    title: '',
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    onChange(name, value);
  };

  const putVotes = (postId, decision, userVoteDirection) => {
    const token = window.localStorage.getItem("token")
    let body = {};
    if (userVoteDirection === decision) {
      body = { direction: 0 };
    } else {
      body = { direction: decision};
    }
    axios.put(`https://us-central1-labenu-apis.cloudfunctions.net/labEddit/posts/${postId}/vote`, body, {headers: {
    Authorization: token
  }}).then(() => {
        getListPost();
      })
      .catch((err) => {
        alert("Erro ao computar voto!")
      });
  };

  const getListPost = () => {
    const axiosConfig = {
      headers: {
        Authorization: localStorage.getItem('token'),
      },
    };

    setIsLoading(true);
    axios.get(`${baseURL}/posts`, axiosConfig).then((response) => {
      setPosts(response.data.posts);
      setIsLoading(false);
    });

  }
  
  const handlePost = event => {
    event.preventDefault();
    const token = window.localStorage.getItem("token")
    const body = {
      "text": form.text,
	    "title": form.title
    }
    axios.post(`https://us-central1-labenu-apis.cloudfunctions.net/labEddit/posts`,body,{headers: {
      Authorization: token
    }}).then(() => {
        alert("Post criado com sucesso!")
        getListPost()
        resetForm()
    }).catch(() => {
      alert("Erro ao criar post.")
    })
  };

  const onClickDetails = postId => {
    history.push(`/fedd/details/${postId}`)
}

  return (
    <DivContainer>
      <Header
          onClick={handleLogout}
      />
      <Card className={classes.root}>
        
        {isLoading ? <EatLoading />:
      
        <CardContent>
          <FormPost onSubmit={handlePost}>
            <Input variant="outlined" placeholder="Título do Post" value={form.title} name="title" onChange={handleInputChange} />
            <TextField 
              id="outlined-multiline-static"
              multiline
              rows={4}
              variant="outlined"
              placeholder="Escreva seu Post"
              value={form.text}
              name="text"
              onChange={handleInputChange}
            />
            <Button variant="contained" color="primary" type="submit">Postar</Button>
          </FormPost>
          
          {posts.map((post) => {
            return (
              <div key={post.id}>
                <CardActionArea onClick={() => onClickDetails(post.id)}>
                  <Typography gutterBottom variant="h5" component="h2">
                    <hr/>
                    <p>{post.username}</p>
                  </Typography>
                  <Typography variant="body2" color="textSecondary" component="p">
                    <p>{post.text}</p>
                  </Typography>
                </CardActionArea>
                <CardActions>

                  <Button size="small" color="primary" onClick={() => putVotes(post.id, -1, post.userVoteDirection)}>
                    {post.userVoteDirection !== 0 && post.userVoteDirection !== 1 ? <ArrowDownwardIcon color="secondary"/> : <ArrowDownwardIcon color="action"/>}
                  </Button>
                  <p>{post.votesCount}</p>
                  <Button size="small" color="primary" onClick={() => putVotes(post.id, 1, post.userVoteDirection)}>
                  {post.userVoteDirection !== 0 && post.userVoteDirection !== -1 ? <ArrowUpwardIcon color="primary"/> : <ArrowUpwardIcon color="action"/>}
                  </Button>
                  <p>{post.commentsCount}</p>
                  <Button size="small" color="primary" onClick={() => onClickDetails(post.id)}>
                    {post.commentsCount <= 1 ? "Comentário" : "Comentários"}
                  </Button>
                </CardActions>
                <hr/>
              </div>
            )
          })}
        </CardContent>
        }
      </Card>
    </DivContainer>
  );
}

export default FeedPage;