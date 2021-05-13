
##############################################################################################


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
  if [ $# -ne 5   ]; then
     echo "component_generate args error"
     exit 1
  fi
  echo "component_generate"
  PROJECTPATH=$1
  PROJECTNAME=$2
  COMPONENT_GROUP=$3
  ORG_COMPONENT=$4
  NEW_COMPONENT=$5
  echo "  " $PROJECTPATH " " $PROJECTNAME
  echo "  " $COMPONENT_GROUP " " $ORG_COMPONENT " " $NEW_COMPONENT
}

component_show() {
  if [ $# -ne 5   ]; then
     echo "component_show args error"
     exit 1
  fi
  echo "component_show"
  PROJECTPATH=$1
  PROJECTNAME=$2
  COMPONENT_GROUP=$3
  ORG_COMPONENT=$4
  NEW_COMPONENT=$5
  echo "  " $PROJECTPATH " " $PROJECTNAME
  echo "  " $COMPONENT_GROUP " " $ORG_COMPONENT " " $NEW_COMPONENT
  ls $PROJECTPATH
  tree -L 1 $PROJECTPATH
}

component_delete() {
  if [ $# -ne 5   ]; then
     echo "component_delete args error"
     exit 1
  fi
  echo "component_delete"
  PROJECTPATH=$1
  PROJECTNAME=$2
  COMPONENT_GROUP=$3
  ORG_COMPONENT=$4
  NEW_COMPONENT=$5
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
NEW_COMPONENT="gs-"${PARA[1]}
PROJECTPATH="./projects/"$COMPONENT_GROUP"/"$NEW_COMPONENT
PROJECTNAME="@"$COMPONENT_GROUP"/"$NEW_COMPONENT

if [ -n "$FLAG_G" ]; then
  component_generate $PROJECTPATH $PROJECTNAME $COMPONENT_GROUP $ORG_COMPONENT $NEW_COMPONENT
fi
if [ -n "$FLAG_S" ]; then
  component_show     $PROJECTPATH $PROJECTNAME $COMPONENT_GROUP $ORG_COMPONENT $NEW_COMPONENT
fi
if [ -n "$FLAG_D" ]; then
  component_delete   $PROJECTPATH $PROJECTNAME $COMPONENT_GROUP $ORG_COMPONENT $NEW_COMPONENT
fi





