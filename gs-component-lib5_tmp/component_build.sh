
##############################################################################################

ORG_JS_COMPONENTS_PATH=../orglib/ej2-javascript-ui-controls/controls
ORG_ANGULAR_COMPONENTS_PATH=../orglib/ej2-angular-ui-components/components
PYTOOLS_PATH=`pwd`"/"pytools

usage_exit() {
        #echo "Usage: $0 [-g] [-s] [-d] org_component_name" 1>&2
        echo "Usage: $0  <-g/-s/-d>  org_component_name" 1>&2
        echo "        -g generate"
        echo "        -s show"
        echo "        -d dalete"
        exit 1
}

while getopts gsdh OPT
do
    case $OPT in
        g)  FLAG_G=1
            ;;
        s)  FLAG_S=1
            ;;
        d)  FLAG_D=1
            ;;
        h)  usage_exit
            ;;
        \?) usage_exit
            ;;
    esac
done

shift $((OPTIND - 1))

#echo $*
#echo $#

if [ -z "$FLAG_G"  -a  -z "$FLAG_S"  -a  -z "$FLAG_D" ]; then
   echo "Error -a or -s or -d"
   usage_exit
fi
if [ -n "$FLAG_G"  -a  -n "$FLAG_S" -a  -n "$FLAG_D" ]; then
   echo "Error -a or -s or -d"
   usage_exit
fi
if [ -n "$FLAG_G"  -a  -n "$FLAG_S" ]; then
   echo "Error -a or -s or -d"
   usage_exit
fi
if [ -n "$FLAG_G"  -a  -n "$FLAG_D" ]; then
   echo "Error -a or -s or -d"
   usage_exit
fi
if [ -n "$FLAG_S" -a  -n "$FLAG_D" ]; then
   echo "Error -a or -s or -d"
   usage_exit
fi

if [ $# -ne 1   ]; then
   echo "Error org_component_name"
   usage_exit
fi

##############################################################################################
component_generate() {
  if [ $# -ne 6   ]; then
     echo "component_generate args error"
     exit 1
  fi
  echo "component_generate"
  BASE_NAME=$1
  PROJECTPATH=$2
  PROJECTNAME=$3
  COMPONENT_GROUP=$4
  ORG_COMPONENT=$5
  NEW_COMPONENT=$6
  echo "  " $PROJECTPATH " " $PROJECTNAME
  echo "  " $COMPONENT_GROUP " " $ORG_COMPONENT " " $NEW_COMPONENT
  JPATH=$ORG_JS_COMPONENTS_PATH"/"$BASE_NAME
  APATH=$ORG_ANGULAR_COMPONENTS_PATH"/"$BASE_NAME

  if [ ! -d $PROJECTPATH ]; then
    echo "not exist :"$PROJECTPATH
    exit 1
  fi
  PWD=`pwd`

  rm -rf $PROJECTPATH"/src"
  rm -rf $PROJECTPATH"/styles"
  cp -r $JPATH"/src"    $PROJECTPATH
  cp -r $JPATH"/styles" $PROJECTPATH
  cp -r ./template/*    $PROJECTPATH
  cd $PROJECTPATH
  ./scss2css.sh
  cd ./src
  mv index.ts  public-api.ts
  python $PYTOOLS_PATH/dirwalk.py
  cd $PWD

}

component_show() {
  if [ $# -ne 6   ]; then
     echo "component_show args error"
     exit 1
  fi
  echo "component_show"
  BASE_NAME=$1
  PROJECTPATH=$2
  PROJECTNAME=$3
  COMPONENT_GROUP=$4
  ORG_COMPONENT=$5
  NEW_COMPONENT=$6
  echo "  " $PROJECTPATH " " $PROJECTNAME
  echo "  " $COMPONENT_GROUP " " $ORG_COMPONENT " " $NEW_COMPONENT
  ls $PROJECTPATH
  tree -L 1 $PROJECTPATH
}

component_delete() {
  if [ $# -ne 6   ]; then
     echo "component_delete args error"
     exit 1
  fi
  echo "component_delete"
  BASE_NAME=$1
  PROJECTPATH=$2
  PROJECTNAME=$3
  COMPONENT_GROUP=$4
  ORG_COMPONENT=$5
  NEW_COMPONENT=$6
  echo "  " $PROJECTPATH " " $PROJECTNAME
  echo "  " $COMPONENT_GROUP " " $ORG_COMPONENT " " $NEW_COMPONENT
}

##############################################################################################
COMPONENT_GROUP="gs-common-lib"
#ORG_COMPONENT="ej2-spreadsheet"
ORG_COMPONENT=$1
PARA=(${ORG_COMPONENT//-/ })
#echo  ${PARA[0]}
#echo  ${PARA[1]}
BASE_NAME=${PARA[1]}
NEW_COMPONENT="gs-"${PARA[1]}
PROJECTPATH="./projects/"$COMPONENT_GROUP"/"$NEW_COMPONENT
PROJECTNAME="@"$COMPONENT_GROUP"/"$NEW_COMPONENT

if [ -n "$FLAG_G" ]; then
  component_generate $BASE_NAME $PROJECTPATH $PROJECTNAME $COMPONENT_GROUP $ORG_COMPONENT $NEW_COMPONENT
fi
if [ -n "$FLAG_S" ]; then
  component_show     $BASE_NAME $PROJECTPATH $PROJECTNAME $COMPONENT_GROUP $ORG_COMPONENT $NEW_COMPONENT
fi
if [ -n "$FLAG_D" ]; then
  component_delete   $BASE_NAME $PROJECTPATH $PROJECTNAME $COMPONENT_GROUP $ORG_COMPONENT $NEW_COMPONENT
fi





