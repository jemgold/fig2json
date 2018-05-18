import * as React from 'react';
import { FigmaLoginButton } from '../components/FigmaLoginButton';
import { Provider, Pre } from 'rebass';
import theme from '../components/theme';
import * as Figma from 'figma-js';
import queryString from 'query-string';
import SyntaxHighlighter, {
  registerLanguage,
} from 'react-syntax-highlighter/light';
import json from 'react-syntax-highlighter/languages/hljs/json';
import atomOneDark from 'react-syntax-highlighter/styles/hljs/atom-one-dark';
import { CopyToClipboard } from 'react-copy-to-clipboard';

registerLanguage('json', json);

import {
  Flex,
  Container,
  Box,
  Button,
  Input,
  Label,
  NavLink,
  Row,
  Column,
  Code,
  Text,
} from 'rebass';
import { figmaFileId } from '../utils/figmaFileId';

interface State {
  value: string;
  data?: any;
  loading: boolean;
  accessToken?: string;
}

export default class Index extends React.Component<{}, State> {
  constructor(props) {
    super(props);

    this.state = {
      value: '',
      loading: false,
    };
  }

  componentDidMount() {
    const { access_token: accessToken } = queryString.parse(location.search);

    if (accessToken) {
      this.setState({
        accessToken: accessToken,
      });

      localStorage.setItem('accessToken', accessToken);
      return;
    }

    let localToken = localStorage.getItem('accessToken');

    if (localToken) {
      this.setState({ accessToken: localToken });
    }
  }

  onInput = (e: React.FormEvent<HTMLInputElement>) => {
    this.setState({
      value: e.currentTarget.value.trim(),
    });
  };

  onSubmitForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { value, accessToken } = this.state;

    if (!value || !accessToken) {
      return;
    }

    this.setState({ loading: true });

    const client = Figma.Client({
      accessToken,
    });

    client
      .file(figmaFileId(value))
      .then(({ data }) => {
        this.setState({ data, loading: false });
      })
      .catch(e => {
        this.setState({
          loading: false,
        });
      });
  };

  onLogout = e => {
    e.preventDefault();

    window.localStorage.removeItem('accessToken');

    this.setState({ accessToken: null });
  };

  renderBody() {
    return (
      <Box>
        <Box is="form" onSubmit={this.onSubmitForm} mb={4}>
          <Label color="mono.0">Figma File URL</Label>
          <Input
            color="mono.0"
            border="1px solid !important"
            boxShadow="none"
            disabled={this.state.loading}
            fontSize={[1, 2, 3, 4]}
            p={[2, 2, 3]}
            placeholder="http://figma.com/file/123153/my-rad-file"
            onChange={this.onInput}
          />
        </Box>

        {this.state.loading && <Text color="mono.0">Loading…</Text>}
        {this.state.data && (
          <Box>
            <CopyToClipboard text={JSON.stringify(this.state.data, null, 2)}>
              <Button bg="mono.0" color="base">
                Copy to clipboard
              </Button>
            </CopyToClipboard>
            <SyntaxHighlighter
              language="json"
              style={atomOneDark}
              PreTag={Pre}
              CodeTag={Code}
            >
              {JSON.stringify(this.state.data, null, 2)}
            </SyntaxHighlighter>
          </Box>
        )}
      </Box>
    );
  }
  render() {
    return (
      <Provider theme={theme}>
        <Box bg="base" style={{ minHeight: '100vh' }}>
          <Container>
            <Row py={3}>
              <Column>
                <NavLink color="mono.0">fig2json</NavLink>
              </Column>
              <Column flex="0">
                <NavLink
                  color="mono.0"
                  href="https://github.com/jongold/fig2json"
                >
                  GitHub
                </NavLink>
              </Column>
              {this.state.accessToken && (
                <Column flex="0">
                  <NavLink color="mono.0" onClick={this.onLogout}>
                    Logout
                  </NavLink>
                </Column>
              )}
            </Row>
            {this.state.accessToken ? (
              this.renderBody()
            ) : (
              <FigmaLoginButton
                bg="hue.3"
                color="base"
                href="https://micro-figma-fig2json.now.sh/login"
              />
            )}
          </Container>
        </Box>
      </Provider>
    );
  }
}
