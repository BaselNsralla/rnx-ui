/**
 * 文本框，文字超长时滚动显示
 */
import React, {
  Component,
  PropTypes,
} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
  Easing,
} from 'react-native';

const styles = StyleSheet.create({
  wrapper: {
    height: 45,
    overflow: 'hidden',
  },
  container: {
    flex: 1,
    overflow: 'hidden',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  contentContainer: {
    alignSelf: 'flex-start',
    width: 10000,
    height: 45,
  },
  text: {
    position: 'absolute',
    top: 0,
    left: 0,
    marginTop: 22.5,
  },
});

const MODE_RESTART = 'restart';
const MODE_REVERSE = 'reverse';

class DymanicText extends Component {
  constructor(props) {
    super(props);
    this.state = {
      translateX: new Animated.Value(0),
    };
    this.scrollText = this.scrollText.bind(this);
  }
  scrollText(offSet, isPositionStart) {
    setTimeout(() => {
      Animated.timing(this.state.translateX, {
        duration: Math.abs(offSet) * (100 / this.props.speed),
        toValue: isPositionStart ? offSet : 0,
        easing: Easing.linear,
      }).start(() => {
        if (this.props.mode === MODE_REVERSE) {
          // 从末尾滚动至文字开始
          this.scrollText(offSet, !isPositionStart);
        } else if (this.props.mode === MODE_RESTART) {
          setTimeout(() => {
            // 跳回文字开始，并开始新的动画滚动到文字末尾
            this.state.translateX.setValue(0);
            this.scrollText(offSet, true);
          }, this.props.bufferTime);
        }
      });
    }, this.props.bufferTime);
  }
  render() {
    const { viewWidth, textWidth, textHeight } = this.state;
    const offSet = viewWidth - textWidth;
    const contentContainerStyle = {};
    const textStyle = {};
    const propStyle = StyleSheet.flatten(this.props.style);

    if (!isNaN(offSet)) {
      if (offSet < 0) {
        this.scrollText(offSet, true);
      } else {
        // 若文字长度不超过容器，使container居中显示
        contentContainerStyle.alignSelf = 'center';
        contentContainerStyle.width = textWidth;
      }
    }
    // 如果更改了wrapper height，更新contentContainer的高度
    if (propStyle && propStyle.height) {
      contentContainerStyle.height = propStyle.height;
      textStyle.marginTop = propStyle.height / 2;
    }
    // 使文字垂直居中
    if (textHeight) {
      contentContainerStyle.transform = [{
        translateY: -textHeight / 2,
      }];
    }
    return (
      <View style={[styles.wrapper, this.props.style]}>
        <View
          style={styles.container}
          onLayout={({ nativeEvent }) => {
            this.setState({
              viewWidth: nativeEvent.layout.width,
            });
          }}
        >
          <View style={[styles.contentContainer, contentContainerStyle]}>
            <Animated.Text
              numberOfLines={1}
              style={[
                styles.text,
                textStyle,
                this.props.textStyle, {
                  transform: [
                    {
                      translateX: this.state.translateX,
                      tramslateY: -18,
                    },
                  ],
                },
              ]}
              onLayout={({ nativeEvent }) => {
                this.setState({
                  textWidth: nativeEvent.layout.width,
                  textHeight: nativeEvent.layout.height,
                });
              }}
            >{this.props.text}</Animated.Text>
          </View>
        </View>
      </View>
    );
  }
}

DymanicText.propTypes = {
  // 自定义wrapper样式
  style: View.propTypes.style,
  // 自定义文本样式
  textStyle: Text.propTypes.style,
  // 显示文本
  text: PropTypes.string,
  // 文字循环模式，默认reverse
  // reverse：轮转到末尾后再轮转回开头
  // restart: 轮转到末尾后返回至开头重新循环
  mode: PropTypes.oneOf([MODE_RESTART, MODE_REVERSE]),
  // 动画间隔时间，默认500
  bufferTime: PropTypes.number,
  // 文字滚动速度，默认5，数字越大，速度越快
  speed: PropTypes.number,
};
DymanicText.defaultProps = {
  style: null,
  textStyle: null,
  text: null,
  mode: MODE_REVERSE,
  bufferTime: 500,
  speed: 5,
};

export default DymanicText;
